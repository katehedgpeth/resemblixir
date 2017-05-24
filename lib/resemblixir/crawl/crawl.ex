defmodule Resemblixir.Crawl do
  require Logger
  # import Hound
  # import Hound.Helpers.Cookie
  # import Hound.Helpers.Dialog
  # import Hound.Helpers.Element
  # import Hound.Helpers.Navigation
  # import Hound.Helpers.Orientation
  # import Hound.Helpers.Page
  # import Hound.Helpers.Screenshot
  # import Hound.Helpers.SavePage
  # import Hound.Helpers.ScriptExecution
  # import Hound.Helpers.Session
  # import Hound.Helpers.Window
  # import Hound.Helpers.Log
  # import Hound.Helpers.Mouse
  # import Hound.Matchers

  defmodule State do
    defstruct [:module, :parent, :port]
  end

  alias Resemblixir.Crawl.State

  @breakpoints [
    xs_narrow: {320, 568},
    xs_wide: {543, 600}
  ]

  @tests [
    %{
      name: :homepage,
      path: ''
    }
  ]

  def start_link(parent) do
    GenServer.start_link(__MODULE__, [self()])
  end

  def init([parent]) do
    {:ok, %{parent: parent, tests: %{}}}
  end

  def handle_cast(:start, state) do
    tests = start()
    {:noreply, %{state | tests: tests}}
  end

  def handle_info({port, {:data, _}}, %{parent: parent, tests: tests}) do
    GenServer.cast(parent, {:screenshot_ready, Map.get(tests, port)})
    {:noreply, %{parent: parent, tests: Map.delete(tests, port)}}
  end

  def start() do
    folder = make_test_folder()
    Enum.flat_map(@tests, fn %{name: name, path: path} ->
      name_charlist = name |> Atom.to_string() |> String.to_charlist()
      breakpoint_tests = for {breakpoint, {width, height}} <- @breakpoints do
        breakpoint_charlist = breakpoint
        |> Atom.to_string()
        |> String.to_charlist()
        port = screenshot(%{breakpoint: breakpoint_charlist,
                            name: name_charlist,
                            path: path,
                            width: width,
                            height: height,
                            folder: folder})
        {port, {name, breakpoint}}
      end
    end)
    |> Enum.into(%{})
  end

  def make_test_folder() do
    date = DateTime.utc_now()

    folder = :resemblixir
    |> Application.app_dir()
    |> Path.join("priv")
    |> Path.join("#{date.year}#{date.month}#{date.day}_#{date.hour}#{date.minute}#{date.second}")

    :ok = File.mkdir(folder)

    folder
    |> String.to_charlist()
    |> IO.inspect()
  end

  def screenshot(args) do
    Port.open(
      {:spawn, "node ./assets/electron-screenshot.js"},
      [:stderr_to_stdout,
        env: [
          {'URL', 'http://localhost:4001'},
          {'TEST_NAME', args.name},
          {'TEST_PATH', args.path},
          {'BREAKPOINT', args.breakpoint},
          {'TEST_WIDTH', args.width},
          {'TEST_HEIGHT', args.height},
          {'TEST_FOLDER', args.folder}
        ]
          # {'MIX_ENV', 'prod'},
          # {'PORT', '8082'},
          # {'STATIC_SCHEME', 'http'},
          # {'STATIC_HOST', 'localhost'},
          # {'STATIC_PORT', '8082'},
          # {'V3_URL', 'http://localhost:8080'}
      ])
  end

  def terminate(reason, %{port: port} = state) do
    _ = Logger.info "shutting down Crawler"
    :ok = kill_port(port)
    true = try do
             Port.close(port)
           rescue
             ArgumentError -> true
           end
    reason
  end

  def command, do: "node ./assets/electron-screenshot.js"

  @spec kill_port(port) :: :ok
  defp kill_port(port) do
    case Port.info(port, :os_pid) do
      {:os_pid, pid} ->
        _ = System.cmd("kill", [Integer.to_string(pid)], stderr_to_stdout: true)
        :ok
      nil -> :ok
    end
  end
end
