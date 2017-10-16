defmodule Resemblixir.Breakpoint do
  alias Resemblixir.{Scenario, Compare, Paths, Screenshot}

  @spec run({name::atom, width::integer}, Scenario.t) :: {:ok, {name::atom, Compare.t}}
  def run({breakpoint_name, breakpoint_width}, %Scenario{url: url, folder: "/" <> _} = scenario)
  when is_atom(breakpoint_name) and is_integer(breakpoint_width) and is_binary(url) do
    ref_image = ref_image_path(scenario, breakpoint_name)
    if File.exists?(ref_image) do
      do_run({breakpoint_name, breakpoint_width}, scenario, ref_image)
    else
      {:error, {breakpoint_name, %Resemblixir.MissingReferenceError{path: ref_image, breakpoint: breakpoint_name}}}
    end
  end

  @spec do_run({breakpoint::atom, width::integer}, Scenario.t, ref_path::String.t) :: Compare.result
  defp do_run({breakpoint_name, breakpoint_width}, %Scenario{} = scenario, ref_image) do
    scenario
    |> Screenshot.take({breakpoint_name, breakpoint_width})
    |> Compare.compare(scenario, breakpoint_name, ref_image)
    |> finish()
  end

  def ref_image_path(%Scenario{name: scenario_name}, breakpoint_name)
  when is_binary(scenario_name) and is_atom(breakpoint_name) do
    scenario_name
    |> breakpoint_file_name(breakpoint_name)
    |> Paths.reference_file()
  end

  def test_image_path(%Scenario{name: scenario_name, folder: test_folder_name}, breakpoint_name)
  when is_binary(scenario_name) and is_atom(breakpoint_name) do
    Paths.test_file(test_folder_name, breakpoint_file_name(scenario_name, breakpoint_name))
  end

  defp finish({:ok, %Compare{breakpoint: name} = result}), do: {:ok, {name, result}}
  defp finish({:error, %Compare{breakpoint: name, images: %{diff: diff}} = result}) when is_binary(diff), do: {:error, {name, result}}

  defp breakpoint_file_name(scenario_name, breakpoint_name) do
    scenario_name
    |> String.replace(" ", "_")
    |> String.downcase()
    |> Kernel.<>("_#{breakpoint_name}.png")
  end
end
