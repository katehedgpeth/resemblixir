defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(_args \\ []) do
    Resemblixir.run()
  end

end
