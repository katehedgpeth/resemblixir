defmodule Resemblixir.References do
  require Logger
  @moduledoc """
  Generates reference screenshots for scenarios.
  """
  alias Resemblixir.{Paths, Scenario, Screenshot}

  @type breakpoint_result :: {atom, String.t}
  @type scenario_result :: {String.t, [breakpoint_result]}
  @type error :: {:error, any}

  @doc """
  Generate screenshots for multiple scenarios. Scenarios must have at least one breakpoint defined. Reference images will be saved to
  priv/resemblixir/reference_images.

  Returns {:ok, [{scenario_name, [{breakpoint_name, reference_image_path}]}]} | {:error, error}.
  """
  @spec generate([%{required(:name) => String.t, required(:url) => String.t, required(:breakpoints) => Keyword.t}]) :: {:ok, [scenario_result]} | error
  def generate([%{name: _, url: _, breakpoints: breakpoints} | _] = scenarios) do
    Paths.reference_image_dir()
    |> File.mkdir_p()

    scenarios
    |> Enum.map(& struct(Scenario, Enum.into(&1, [])))
    |> Task.async_stream(&generate_scenario/1, timeout: 60_000)
    |> Enum.reduce({:ok, []}, &await_scenario/2)
  end

  @doc """
  Generate screenshots for all breakpoints for a scenario. Scenario must have at least one breakpoint defined.

  Returns {scenario_name, [{breakpoint_name, reference_image_path}]}.
  """
  @spec generate_scenario(Scenario.t) :: scenario_result
  def generate_scenario(%Scenario{breakpoints: breakpoints} = scenario) do
    breakpoint_screenshots = breakpoints
    |> Task.async_stream(&generate_breakpoint(&1, scenario), timeout: 10_000)
    |> Enum.map(&await_breakpoint/1)

    {scenario.name, breakpoint_screenshots}
  end

  @spec await_scenario({:ok, scenario_result} | error, {:ok, [scenario_result]} | error)
        :: {:ok, [scenario_result]} | error
  defp await_scenario({:ok, {scenario_name, breakpoints}}, {:ok, scenarios}) do
    {:ok, [{scenario_name, breakpoints} | scenarios]}
  end
  defp await_scenario({:ok, _}, {:error, error}), do: {:error, error}
  defp await_scenario({:error, error}, _), do: {:error, error}


  @doc """
  Generates a reference image for a single breakpoint.

  Returns {breakpoint_name, reference_image_path}
  """
  @spec generate_breakpoint({breakpoint_name::atom, width::integer}, Scenario.t) :: breakpoint_result
  def generate_breakpoint({breakpoint_name, width}, %Scenario{name: scenario_name} = scenario)
  when is_binary(scenario_name) and is_atom(breakpoint_name) and is_integer(width) do
    reference_path = scenario_name
                     |> Paths.file_name(breakpoint_name)
                     |> Paths.reference_file()
    Logger.info "generating " <> reference_path

    %Screenshot{path: screenshot} = Screenshot.take(%{scenario | folder: Paths.reference_image_dir()}, {breakpoint_name, width})

    {breakpoint_name, reference_path}
  end

  @spec await_breakpoint({:ok, breakpoint_result}) :: breakpoint_result
  defp await_breakpoint({:ok, {breakpoint_name, image}}), do: {breakpoint_name, image}
end
