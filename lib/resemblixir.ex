defmodule Resemblixir do
  alias Resemblixir.{Scenario, Paths}

  defstruct [passed: [], failed: []]

  @default_opts [
    async: false,
    parent: self()
  ]

  # TODO: result format options
  # TODO: &run!/2
  def run(scenarios \\ nil, opts \\ @default_opts)
  def run(nil, opts) do
    run(get_scenarios(), opts)
  end
  def run([], _) do
    raise %Resemblixir.NoScenariosError{}
  end
  def run([_ | _] = scenarios, _opts) do
    folder = make_test_folder()
    scenarios
    |> Task.async_stream(&start_scenario(&1, folder), max_concurrency: System.schedulers_online * 2, ordered: false, on_timeout: :kill_task)
    |> Enum.reduce(%__MODULE__{}, &await_scenario/2)
    |> finish()
  end

  defp await_scenario({:ok, {:ok, %Scenario{} = scenario}}, %__MODULE__{} = result) do
    %{result | passed: [scenario | result.passed]}
  end
  defp await_scenario({:ok, {:error, %Scenario{} = scenario}}, %__MODULE__{} = result) do
    %{result | failed: [scenario | result.failed]}
  end
  defp await_scenario({:exit, :timeout}, %__MODULE__{} = result), do: %{result | failed: [:timeout | result.failed]}

  defp finish(%__MODULE__{failed: []} = result), do: {:ok, result}
  defp finish(%__MODULE__{} = result), do: {:error, result}

  def handle_info(message, {scenarios, parent, result}) do
    IO.inspect message, label: "unexpected message in Resemblixir"
    {:noreply, {scenarios, parent, result}}
  end

  def make_test_folder() do
    test_folder = Paths.new_test_name()
                  |> Paths.test_dir()
    :ok = File.mkdir_p(test_folder)
    test_folder
  end

  @spec start_scenario(scenario::map | Keyword.t, folder::String.t) :: {:ok | :error, Scenario.t}
  defp start_scenario(scenario, folder) when is_list(scenario) or is_map(scenario) do
    scenario
    |> Enum.into(%{})
    |> Map.put(:folder, folder)
    |> do_start_scenario()
  end

  @spec do_start_scenario(map) :: {:ok | :error, Scenario.t}
  defp do_start_scenario(scenario) do
    Scenario
    |> struct(scenario)
    |> Scenario.run()
  end

  def get_scenarios do
    case Application.get_env(:resemblixir, :scenarios) do
      "/" <> _ = json_path ->
        json_path
        |> File.read!()
        |> Poison.decode!(keys: :atoms!)
      other -> raise %Resemblixir.ScenarioConfigError{scenarios: other}
    end
  end

end
