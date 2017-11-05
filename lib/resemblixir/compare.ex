defmodule Resemblixir.Compare do
  require EEx

  use Wallaby.DSL
  use GenServer

  alias Resemblixir.{Scenario, Screenshot, Breakpoint}
  defstruct [:test, :scenario, :breakpoint, :mismatch_percentage, :bypass, :session,
             :raw_mismatch_percentage, :is_same_dimensions, :analysis_time,
             dimension_difference: %{height: nil, width: nil},
             diff_bounds: %{top: nil, bottom: nil, left: nil, right: nil},
             images: %{ref: nil, test: nil, diff: nil}]

  @type t :: %__MODULE__{
    test: String.t | nil,
    scenario: String.t | nil,
    breakpoint: atom | nil,
    images: %{required(:ref) => String.t | nil, required(:test) => String.t | nil, required(:diff) => String.t | nil},
    bypass: Bypass.t | nil,
    session: Wallaby.Session.t | nil,
    mismatch_percentage: String.t | nil,
    raw_mismatch_percentage: float | nil,
    dimension_difference: %{required(:width) => integer, required(:height) => integer} | nil,
    is_same_dimensions: boolean | nil
  }

  @type error :: {:javascript_error, String.t} | :timeout
  @type success :: {:ok, __MODULE__.t}
  @type failure :: {:error, error, __MODULE__.t}
  @type result :: success | failure

  @spec compare(test_image_path :: String.t, Scenario.t, breakpoint :: atom, ref_image_path :: String.t) :: result
  def compare(%Screenshot{path: test_image_path}, %Scenario{name: test_name}, breakpoint, ref_image_path) when is_binary(test_image_path) do
    %__MODULE__{ scenario: test_name, breakpoint: breakpoint, images: %{ref: ref_image_path, test: test_image_path} }
    |> setup_bypass()
    |> do_compare()
  rescue
    error -> {:error, error}
  end

  def server_name(%__MODULE__{scenario: <<scenario::binary>>, breakpoint: breakpoint}) when is_atom(breakpoint) do
    %Scenario{name: scenario}
    |> Breakpoint.server_name(breakpoint)
    |> Module.concat(:Compare)
  end

  defp do_compare(%__MODULE__{bypass: %Bypass{port: port}, scenario: test_name, breakpoint: breakpoint} = state) do
    # TODO: use :poolboy.transation to run  
    {:ok, session} = Wallaby.start_session()
    session
    |> Wallaby.Browser.visit("http://localhost:" <> Integer.to_string(port) <> http_path(test_name, breakpoint))
    |> Wallaby.Browser.assert_has(Wallaby.Query.css("#result"))
    |> Wallaby.Browser.execute_script("return window.RESULT", &send_result(&1, state) )
    |> Wallaby.end_session()
  rescue
    error -> {:error, error}
  end

  def send_result(%{"data" => %{}, "diff" => _} = response, %__MODULE__{} = state) do
    result = response
    |> Poison.encode!()
    |> Poison.decode(keys: :atoms!)
    |> format(state)
    |> analyze_result()
    send self(), {:result, result}
  end

  def container_id(ref, test) do
    IO.iodata_to_binary(["test_", path_to_id(ref, "ref"), "_", path_to_id(test, "test")])
  end

  def path_to_id(path, type) when is_binary(path) do
    IO.iodata_to_binary(["image_", type, "_", Path.basename(path, ".png")])
  end

  defp setup_bypass(%__MODULE__{ scenario: test_name, breakpoint: breakpoint, images: %{ref: ref, test: test}} = state) do
    bypass = open_bypass()
    Bypass.expect(bypass, "GET", http_path(test_name, breakpoint), &render_template(&1, test_name))
    Bypass.expect(bypass, "GET", IO.iodata_to_binary(["/ref/", test_name, ".png"]), &render_image(&1, ref))
    Bypass.expect(bypass, "GET", IO.iodata_to_binary(["/test/", test_name, ".png"]), &render_image(&1, test))
    Bypass.expect(bypass, "GET", "/resemble.js", &render_js/1)
    %{state | bypass: bypass}
  end

  defp http_path(test_name, breakpoint) when is_binary(test_name) and is_atom(breakpoint) do
    IO.iodata_to_binary(["/", test_name, "_", Atom.to_string(breakpoint)])
  end

  defp render_template(conn, test_name) do
    Plug.Conn.resp(conn, 200, """
      <html>
        <head><script type="text/javascript" src="resemble.js"></script></head>
        <body>
          <script type="text/javascript">
            window.RESULT = "not returned";

            const testName = "#{test_name}";

            function path(type) {
              return "/" + type + "/" + testName + ".png"
            }

            function appendImage(type) {
              const img = document.createElement("img");
              img.src = path(type);
              img.id = type;
              document.body.appendChild(img);
              return img;
            }


            appendImage("ref");
            appendImage("test");

            resemble(path("ref")).compareTo(path("test")).onComplete(function(data) {
              const isDiff = (data.rawMisMatchPercentage > 0) ||
                              (data.dimensionDifference.height != 0) ||
                              (data.dimensionDifference.width != 0);
              const diff = isDiff ?  data.getImageDataUrl() : null;
              window.RESULT = {data: data, diff: diff};
              const container = document.createElement("div")
              container.innerHTML = JSON.stringify(window.RESULT);
              container.id = "result";
              document.body.appendChild(container);
            });

          </script>
        </body>
      </html>
    """)
  end

  defp render_image(conn, image_path) do
    Plug.Conn.resp(conn, 200, File.read!(image_path))
  end

  defp render_js(conn) do
    js = Path.join([Application.app_dir(:resemblixir), "priv", "js", "resemble.js"])
    Plug.Conn.resp(conn, 200, File.read!(js))
  end

  defp open_bypass do
    case Supervisor.start_child(Bypass.Supervisor, [[]]) do
      {:ok, pid} ->
        port = Bypass.Instance.call(pid, :port)
        %Bypass{pid: pid, port: port}
      other ->
        other
    end
  end

  def format({:ok, %{diff: diff, data: comparison}}, %__MODULE__{} = data), do: do_format(data, diff, comparison)
  def format({:error, error}, %__MODULE__{} = data), do: {:error, {:json_error, error, data}}
  def format(error, %__MODULE__{} = data), do: {:error, {{:unexpected_error, error}, data}}

  defp do_format(%__MODULE__{} = data, diff, %{
      misMatchPercentage: mismatch, rawMisMatchPercentage: raw_mismatch,
      dimensionDifference: %{ height: _, width: _} = dimensions,
      diffBounds: %{ top: _, bottom: _, left: _, right: _} = diff_bounds,
      isSameDimensions: is_same_dim, analysisTime: time,
      getImageDataUrl: _
    }), do: %{data | mismatch_percentage: mismatch,
                     raw_mismatch_percentage: raw_mismatch,
                     dimension_difference: dimensions,
                     is_same_dimensions: is_same_dim,
                     diff_bounds: diff_bounds,
                     analysis_time: time,
                     images: Map.put(data.images, :diff, diff)}

  defp analyze_result({:error, error}), do: {:error, error}
  defp analyze_result(%__MODULE__{images: %{diff: nil}} = result), do: {:ok, result}
  defp analyze_result(%__MODULE__{images: %{test: path, diff: diff} = images} = result) when is_binary(diff) do
    diff_path = Path.join([Path.dirname(path), ["diff_", Path.basename(path, "")]])
    File.write!(diff_path, diff)

    {:error, %{result | images: %{images | diff: diff_path}}}
  end
end
