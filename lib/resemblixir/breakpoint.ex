defmodule Resemblixir.Breakpoint do
  alias Resemblixir.{Scenario, Compare, Paths}

  @spec run({name::atom, width::integer}, Scenario.t, parent::pid) :: {:ok, {name::atom, Compare.t}}
  def run({breakpoint_name, breakpoint_width}, %Scenario{url: url, folder: "/" <> _} = scenario, parent) 
  when is_atom(breakpoint_name) and is_integer(breakpoint_width) and is_binary(url) do
    ref_image = ref_image_path(scenario, breakpoint_name)
    if File.exists?(ref_image) do
      do_run({breakpoint_name, breakpoint_width}, scenario, ref_image, parent)
    else
      send parent, {:error, {breakpoint_name, %Resemblixir.MissingReferenceError{path: ref_image, breakpoint: breakpoint_name}}}
    end
  end

  @spec do_run({breakpoint::atom, width::integer}, Scenario.t, ref_path::String.t, parent::pid) :: Compare.result
  defp do_run({breakpoint_name, breakpoint_width}, %Scenario{url: url} = scenario, ref_image, parent) do
    Wallaby.start_session()
    |> get_breakpoint_screenshot(breakpoint_width, url)
    |> move_test_file(breakpoint_name, scenario)
    |> Compare.compare(scenario, breakpoint_name, ref_image) 
    |> finish(parent)
  end

  @spec get_breakpoint_screenshot({:ok, Wallaby.Session.t}, width::integer, url::String.t) :: path::String.t
  def get_breakpoint_screenshot({:ok, session}, breakpoint_width, url) do
    %Wallaby.Session{screenshots: [screenshot]} = session
    |> Wallaby.Browser.resize_window(breakpoint_width, 1000)
    |> Wallaby.Browser.visit(url)
    |> Wallaby.Browser.take_screenshot()

    Wallaby.end_session(session)

    screenshot
  end

  @spec move_test_file(screenshot::String.t, breakpoint_name::atom, Scenario.t) :: path::String.t
  defp move_test_file(screenshot, breakpoint_name, %Scenario{} = scenario)
  when is_binary(screenshot) and is_atom(breakpoint_name) do
    file_path = test_image_path(scenario, breakpoint_name)
    :ok = File.rename(screenshot, file_path)
    file_path
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

  defp finish({:ok, %Compare{breakpoint: name} = result}, parent), do: send parent, {:ok, {name, result}}
  defp finish({:error, %Compare{breakpoint: name} = result}, parent), do: send parent, {:error, {name, result}}

  defp breakpoint_file_name(scenario_name, breakpoint_name) do
    scenario_name
    |> String.replace(" ", "_")
    |> String.downcase()
    |> Kernel.<>("_#{breakpoint_name}.png")
  end
end
