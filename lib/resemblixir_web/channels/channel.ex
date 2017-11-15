defmodule ResemblixirWeb.Channel do
  use ResemblixirWeb, :channel

  def join("resemblixir:test", _payload, socket) do
    send self(), :start
    {:ok, socket
          |> assign(:tests, %{})
          |> assign(:running, true)}
  end

  def handle_info(:start, socket) do
    setup()
    |> make_params()
    |> Enum.map(& Task.Supervisor.start_child(__MODULE__.Supervisor, __MODULE__, :get_breakpoint, [&1, socket]))
    {:noreply, socket}
  end

  defp setup do
    {:ok, _} = Application.ensure_all_started(:wallaby)
    config = Application.get_all_env(:resemblixir)
    screenshot_dir = Application.app_dir(:resemblixir, "priv/static/images/test")
    screenshot_dir
    |> File.ls!()
    |> Enum.each(&File.rm/1)
    Application.put_env(:wallaby, :screenshot_dir, screenshot_dir)
    Application.put_env(:wallaby, :base_url, config[:base_url] || apply(config[:endpoint], :url, []))
    start_supervisor()
    config
  end

  def make_params(config) do
    for {view, templates} <- config[:scenarios],
        template <- templates,
        {breakpoint, {width, height}} <- config[:breakpoints] do
      {page, query_params} = parse_template(template)
      %{
        view: view,
        template: page,
        query_params: query_params,
        breakpoint: breakpoint,
        width: width,
        height: height,
        file_name: file_name(view, page, breakpoint)
      }
    end
  end

  def parse_template({page, query_params}) when (is_map(query_params) or is_list(query_params))
              and is_atom(page), do: {page, query_params}
  def parse_template(page) when is_atom(page), do: {page, []}

  defp start_supervisor do
    opts = [name: __MODULE__.Supervisor,
            # max_seconds: 60_000 * 10
            restart: :transient]
    case Task.Supervisor.start_link(opts) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
    end
  end

  def get_breakpoint(params, socket) do
    file_path = Path.join(Application.app_dir(:resemblixir, Application.get_env(:wallaby, :screenshot_dir)), params.file_name <> ".png")
    if File.exists?(file_path) do
      broadcast socket, "test_image_ready", params
    else
      broadcast socket, "breakpoint_started", params
      take_screenshot(params, socket)
    end
  end

  def file_name(view, template, breakpoint) do
    [view, template, breakpoint]
    |> Enum.map(&Atom.to_string/1)
    |> Enum.intersperse("_")
    |> IO.iodata_to_binary()
  end

  def take_screenshot(params, socket) do
    config = Application.get_all_env(:resemblixir)
    url = config[:router]
          |> Module.concat(Helpers)
          |> apply(:"#{params.view}_path", [config[:endpoint], params.template, params.query_params])
    IO.inspect url, label: "visiting"
    {:ok, session} = Wallaby.start_session()
    session
    |> Wallaby.Browser.resize_window(params.width, params.height)
    |> Wallaby.Browser.visit(url)
    |> Wallaby.Browser.find(Wallaby.Query.css("body"), &do_take_screenshot(&1, params, socket))
    |> Wallaby.end_session()
  rescue
    error ->
      broadcast! socket, "error", error
  end

  defp do_take_screenshot(element, params, socket) do
    if Wallaby.Browser.visible?(element.parent, Wallaby.Query.css("body")) do
      case Wallaby.Browser.take_screenshot(element.parent, name: params.file_name) do
        %Wallaby.Session{screenshots: [screenshot]} -> {:ok, screenshot}
          broadcast! socket, "test_image_ready", Map.put(params, :screenshot, screenshot)
        error ->
          broadcast! socket, "error", error
      end
      element.parent
    else
      IO.inspect element, label: "not visible yet"
      do_take_screenshot(element, params, socket)
    end
  end
end
