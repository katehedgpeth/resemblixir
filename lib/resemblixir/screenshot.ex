defmodule Resemblixir.Screenshot do
  alias Resemblixir.{Scenario, Paths}

  defstruct [:url, :path]
  @type t :: %__MODULE__{
    url: String.t,
    path: String.t
  }

  @spec take(Scenario.t, breakpoint::atom) :: __MODULE__.t
  def take(%Scenario{url: url, folder: folder, name: name} = scenario, {breakpoint, width})
  when is_binary(url) and is_atom(breakpoint) and is_binary(folder) and is_binary(name) do
    folder
    |> Paths.test_file(Paths.file_name(name, breakpoint))
    |> open_port(url, width)
    |> await_result(url)
  end

  defp await_result(port, url) do
    receive do
      {^port, {:data, "{" <> _ = data}} ->
        close_port(port)
        data
        |> Poison.decode(keys: :atoms!)
        |> format_result(url)
    after
      5_000 -> close_port(port)
    end
  end

  def open_port(path, url, width) when is_binary(path) and is_binary(url) do
    bash = "priv/phantom_wrapper.sh"
           |> Path.absname(Application.app_dir(:resemblixir))
           |> String.to_charlist()
    opts = [:binary, :stderr_to_stdout, :use_stdio, args: [bash, "phantomjs", screenshot_js(), path, url, Integer.to_string(width)]]
    Port.open({:spawn_executable, System.find_executable("sh")}, opts)
  end

  defp close_port(port) do
    case Port.info(port) do
      nil -> :ok
      _ -> Port.close(port)
    end
  end

  defp await_result({result, 0}, url) do
    result
    |> Poison.decode(keys: :atoms!)
    |> format_result(url)
  end

  defp format_result({:ok, %{status: "success", path: path}}, url) do
    %__MODULE__{url: url, path: path}
  end

  defp screenshot_js() do
    :resemblixir
    |> Application.app_dir()
    |> Path.join("/priv/take_screenshot.js")
  end
end
