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
      "\n Some scenarios did not pass :(\n\n",
      "Failed scenarios:\n",
      failed_scenarios(args.failed),
      "\n\n",
      "Scenarios passing:\n",
      Enum.map(args.passed, & ["\s\s\s", &1.name, "\n" ])
    ]
    |> IO.iodata_to_binary()
  end

  defp failed_scenarios(failed) do
    for scenario <- failed do
      [
        "\s\s", scenario.name, ":\n",
        "\s\s\s\sFailing Breakpoints:\n",
        Enum.map(scenario.failed, &failed_breakpoint/1),
        "\n\n",
        "\s\s\s\sPassing Breakpoints:\n",
        Enum.map(scenario.passed, fn {name, _} -> ["\s\s\s\s", Atom.to_string(name), "\n"] end)
      ]
    end
  end

  defp failed_breakpoint({name, %Resemblixir.MissingReferenceError{}}) do
    ["\s\s\s\s", Atom.to_string(name), " -- reference image missing\n"]
  end
  defp failed_breakpoint({name, %Resemblixir.Compare{} = data}) do
    [
      "\s\s\s\s", Atom.to_string(name), " -- image mismatch:\n",
      data
      |> Map.from_struct()
      |> Enum.map(&format_breakpoint_value/1)
    ]
  end

  defp format_breakpoint_value({key, val}) do
    newline = if key == :test, do: "\n\n", else: ",\n"
    ["\s\s\s\s", Atom.to_string(key), ": ", do_format_breakpoint_value(key, val), newline]
  end

  defp do_format_breakpoint_value(:images, val) do
    [
      "%{\n",
      Enum.map(val, fn {name, path} -> ["\s\s\s\s\s\s", Atom.to_string(name), ": ", path, "\n"] end),
      "\s\s\s\s}"
    ]
  end
  defp do_format_breakpoint_value(_key, val), do: inspect(val)
end
