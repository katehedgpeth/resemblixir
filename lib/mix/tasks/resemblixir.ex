defmodule Mix.Tasks.Resemblixir do
  use Mix.Task
  alias Resemblixir.{Paths, Scenario}

  def run(_args \\ []) do
    Resemblixir.run()
  end

end
