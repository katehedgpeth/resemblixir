defmodule Resemblixir.PhantomJs do
  use GenServer

  def start_link() do
    {:ok, _pid} = GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    bash = "priv/phantom_wrapper.sh"
           |> Path.absname(Application.app_dir(:resemblixir))
           |> String.to_charlist()
    opts = [:binary, :stderr_to_stdout, :use_stdio, args: [bash, "phantomjs"]]
    port = Port.open({:spawn_executable, System.find_executable("sh")}, opts)
    IO.inspect port
    {:ok, port}
  end

  def cmd(path, url, width) when is_binary(path) and is_binary(url) and is_integer(width) do
    GenServer.call(__MODULE__, {:cmd, path, url, width})
  end

  def handle_call({:cmd, path, url, width}, _from, port) do
    port
    |> ensure_open()
    |> get_screenshot(width, url, path)
    |> await_screenshot()
  end

  defp await_screenshot(port) do
    receive do
      {^port, {:data, "phantomjs> "}} -> await_screenshot(port)
      {^port, {:data, "{" <> _ = data}} ->
        IO.inspect data
        {:reply, Poison.decode(data), port}
      {^port, {:data, error}} ->
        Port.close(port)
        {:reply, {:error, error}, port}
    end
  end

  defp ensure_open(port) do
    case Port.info(port) do
      nil -> raise "Port has closed!!!"
      _ -> port
    end
  end

  defp get_screenshot(port, width, url, path) do
    js = [
      "const system = require(\"system\"); ",
      "const page = require(\"webpage\").create();",
      "page.viewportSize = { width:", Integer.to_string(width), ", height: 1000 };",
      "page.open(", url, ", function(status) { page.render(", path, ");",
      "system.stdout.write(JSON.stringify({path: ", path, "}));"
    ] |> IO.iodata_to_binary()
    |> IO.inspect()
    Port.command(port, js)
    port
  end

  defp set_viewport_size(port, width) do
    Port.command(port, js)
    port
  end
end
