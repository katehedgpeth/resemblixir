defmodule Mix.Tasks.Resemblixir.References do
  @moduledoc """
  Generate reference files for your Resemblixir scenarios. You must have 
  """

  use Mix.Task

  def run(_args \\ []) do
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    scenarios = Resemblixir.get_scenarios()
    {:ok, _scenarios} = Resemblixir.References.generate(scenarios)
  end
end
