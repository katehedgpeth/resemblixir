defmodule Resemblixir.NoScenariosError do
  defexception [message: "No scenarios provided for Resemblixir to run! Assign scenarios to :scenarios in your :resemblixir config."]
  def exception(_) do
    %__MODULE__{}
  end
end

defmodule Resemblixir.ScenarioConfigError do
  defexception scenarios: []
  def message(_args) do

    """
    Resemblixir expects `Application.get_env(:resemblixir, :scenarios)` to return either a path to a json file, or a list of scenario maps.

    In your config file, you can either list out the scenarios directly in your :resemblixir config, like this:

          `config :resemblixir, scenarios: [%{name: "scenario_1", url: "http://localhost:4001", breakpoints: [...]}, ...`

    Or, alternatively, you can provide a path to a json file that will resolve to a list of maps:

          `config :resemblixir, scenarios: "/path/to/json_file.json"`

    Application.get_env(:resemblixir, :scenarios): #{:resemblixir |> Application.get_env(:scenarios) |> inspect()}
    """
  end
end

defmodule Resemblixir.MissingReferenceError do
  defexception [:message, :path, :breakpoint]
  def exception(args) do
    %__MODULE__{message: "Reference file not found at path: #{args[:path]}"}
  end
end

defmodule Resemblixir.NoBreakpointsError do
  defexception [:message, :scenario]
  def exception(args) do
    %__MODULE__{message: "Scenario #{args[:scenario]} has no breakpoints; please define a Keyword list of breakpoints for this scenario."}
  end
end

defmodule Resemblixir.TestFailure do
  defexception [:passed, :failed, :message]
  def message(args) do
    [
      "\t\t\tFailed scenarios:\n",
      failed_scenarios(args.failed),
      "\n\n",
      "\t\t\tScenarios passing:\n",
      Enum.map(args.passed, & ["\t\t\t", &1.name, "\n" ])
    ]
    |> IO.iodata_to_binary()
  end

  defp failed_scenarios(failed) do
    for scenario <- failed do
      [
        "\t\t\t", scenario.name, ":\n",
        "\t\t\t\tFailing Breakpoints:\n",
        Enum.map(scenario.failed, fn {name, data} -> ["\t\t\t\t", Atom.to_string(name), " -- ", inspect(data), "\n"] end),
        "\t\t\t\tPassing Breakpoints:\n",
        Enum.map(scenario.passed, fn {name, _} -> ["\t\t\t\t", Atom.to_string(name), "\n"] end)
      ]
    end
  end
end
