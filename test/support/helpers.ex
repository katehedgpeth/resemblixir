defmodule Resemblixir.TestHelpers do
  alias Resemblixir.{Scenario, References, Paths}

  @breakpoints xs: 454, sm: 600, md: 800, lg: 1000

  def html(%Scenario{} = scenario, image_path) when is_binary(image_path) do
    [
      "<html>",
        "<head></head>",
        "<body>",
          "<h1>Hello this is a webpage</h1>",
          "<p><img src='", image_path, "' /> </p>",
          "<p>",
            for _ <- 1..100 do [scenario.name, " "] end,
          "</p>",
        "</body>",
      "</html>"
    ] |> IO.iodata_to_binary()
  end

  def image_path(%Scenario{}, page \\ 1) when page in [1, 2] do
    image_name = IO.iodata_to_binary ["img_", Integer.to_string(page), ".png"]
    path = Path.join([File.cwd!(), "test", "support", image_name])
    if File.exists?(path) do
      {:ok, path}
    else
      {:error, path}
    end
  end

  def bypass_url(bypass) do
    URI.to_string(%URI{scheme: "http", host: "localhost", port: bypass.port})
  end

  def ensure_folders do
    ref_folder = Paths.reference_image_dir()
    :ok = File.mkdir_p(ref_folder)
    tests_folder = Paths.tests_dir()
    :ok = File.mkdir_p(tests_folder)
    {:ok, ref: ref_folder, tests: tests_folder}
  end

  def remove_scenario_references(%Scenario{breakpoints: breakpoints, name: scenario_name}) do
    breakpoints
    |> Enum.map(fn {breakpoint_name, _} ->
      Task.async(fn -> remove_breakpoint_reference(breakpoint_name, scenario_name) end)
    end)
    |> Task.yield_many()
    |> Enum.map(fn
      {_task, {:ok, :ok}} -> :ok
      {_task, {:ok, error}} -> error
      {_task, error} -> error
    end)
  end

  defp remove_breakpoint_reference(breakpoint_name, scenario_name)
  when is_atom(breakpoint_name) and is_binary(scenario_name) do
    case scenario_name |> Paths.file_name(breakpoint_name) |> Paths.reference_file() |> File.rm() do
      :ok -> :ok
      {:error, :enoent} -> remove_breakpoint_reference(breakpoint_name, scenario_name)
    end
  end

  def generate_id do
    [:positive]
    |> System.unique_integer()
    |> Integer.to_string()
  end

  def scenario_name(name, int \\ 1) when is_integer(int) and is_atom(name) do
    name = name
           |> Atom.to_string()
           |> String.replace(" ", "_")
           |> String.replace(":", "")
           |> String.replace("{", "")
           |> String.replace("}", "")
           |> String.replace("%", "")
           |> String.replace(",", "")
           |> String.replace("/", "")
           |> String.replace(".", "")
           |> String.slice(0..40)
    IO.iodata_to_binary([name, "_", Integer.to_string(int)])
  end

  def test_paths do
    test_name = Paths.new_test_name()
    test_folder = Path.join([Paths.tests_dir(), test_name])
    {File.mkdir_p(test_folder), name: test_name, folder: test_folder}
  end

  def setup_bypass(%Scenario{name: name} = scenario, %Bypass{} = bypass, page \\ 1, html_string \\ nil) when is_integer(page) do
    {:ok, image_path} = image_path(scenario, page)
    Bypass.expect bypass, "GET", image_path, fn conn ->
      case File.read(image_path) do
        {:ok, file} -> Plug.Conn.resp(conn, 200, file)
        {:error, error} -> Plug.Conn.resp(conn, 404, inspect(error))
      end
    end
    Bypass.expect bypass, "GET", "/" <> name, fn conn ->
      Plug.Conn.resp(conn, 200, html_string || html(scenario, image_path))
    end
  end

  def breakpoints(nil), do: breakpoints(1)
  def breakpoints(count), do: @breakpoints |> Enum.take(count) |> Enum.into(%{})

  def generate_scenario(int, "/" <> _ = test_folder, %Bypass{port: port} = bypass, tags \\ %{}) when is_integer(int) do
    scenario_name = scenario_name(tags.test, int)
    scenario = %Scenario{
      name: scenario_name,
      breakpoints: tags[:breakpoints] || breakpoints(tags[:breakpoint_count]),
      folder: test_folder,
      url: tags[:url] || Path.join([["http://localhost:", Integer.to_string(port)], scenario_name])
    }

    unless tags[:generate_references] == false do
      setup_bypass(scenario, bypass, int)
      :ok = scenario.breakpoints
            |> Enum.map(fn breakpoint ->
              Task.async(fn -> 
                {_, ref_img} = References.generate_breakpoint(breakpoint, scenario)
                true = File.exists?(ref_img)
              end)
            end)
            |> Task.yield_many()
            |> Enum.reduce(:ok, fn
              {_task, {:ok, true}}, :ok -> :ok
              {_task, {:ok, false}}, _ -> :error
              error, _ -> error
            end)
    end
    scenario
  end
end
