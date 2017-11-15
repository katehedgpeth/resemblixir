defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(_) do
    Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    Mix.shell.cmd("open http://localhost:4000")
    Mix.Tasks.Run.run(["--no-halt"])
  end
end
