defmodule Resemblixir.NoScenariosError do
  defexception [message: "No scenarios provided for Resemblixir to run! Assign scenarios to :scenarios in your :resemblixir config."]
  def exception(_) do
    %__MODULE__{} 
  end
end

defmodule Resemblixir.ScenarioConfigError do
  defexception scenarios: []
  def message(args) do

    message = """
    Resemblixir expects scenarios to be a list of %Resemblixir.Scenario{} structs, and for them to be accessible at `Application.get_env(:resemblixir, :scenarios)`.

    In your config file, you can either list out the scenarios directly in your :resemblixir config, like this:

          `config :resemblixir, scenarios: [%Scenario{name: "scenario_1", url: "http://url.com"...`

    Or, alternatively, you can provide a {module, function, args} tuple, which should point to a module and function that will return a list of %Scenario{} structs when applied, like this:

          `config :resemblixir, scenarios: {MyApp.Resemblixir.Scenarios, :config, []}`

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
