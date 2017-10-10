defmodule Mix.Tasks.Resemblixir.References do
  require Logger

  @moduledoc """
  Generate reference files for your Resemblixir scenarios. You must have 
  """

  use Mix.Task

  def run(args \\ []) do
    {opts, _, _} = OptionParser.parse(args, switches: [log: :boolean])
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    scenarios = Resemblixir.get_scenarios()
    {:ok, scenarios} = Resemblixir.References.generate(scenarios)

    unless opts[:log] == false do
      [
        "Generated reference images for ", scenarios |> length() |> Integer.to_string(), " scenarios: \n\n",
        Enum.map(scenarios, fn {name, breakpoints} -> [
          [name, ":\n"],
          Enum.map(breakpoints, fn {_, breakpoint} -> [ "\t\t", breakpoint, "\n" ] end)
        ] end),
        :green
      ]
      |> IO.ANSI.format()
      |> Logger.info()
    end
    {:ok, scenarios}
  end
end
