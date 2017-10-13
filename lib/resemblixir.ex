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
  def run([_ | _] = scenarios, opts) do
    {:ok, pid} = Resemblixir.PhantomJs.start_link()
    scenarios
    |> Enum.map(&struct(Resemblixir.Scenario, Enum.into(&1, %{})))
    |> Task.async_stream(&start_scenario/1, max_concurrency: System.schedulers_online * 2, ordered: false)
    |> Enum.reduce(%__MODULE__{}, &await_scenario/2)
    |> finish(pid)
  end

  defp await_scenario({:ok, scenario}, %__MODULE__{} = result) do
    %{result | passed: [scenario | result.passed]}
  end
  defp await_scenario({:error, scenario}, %__MODULE__{} = result) do
    %{result | failed: [scenario | result.failed]}
  end

  defp finish(%__MODULE__{} = result, pid) do
    GenServer.stop(pid)
    do_finish(result)
  end

  defp do_finish(%__MODULE__{failed: []} = result), do: {:ok, result}
  defp do_finish(%__MODULE__{} = result), do: {:error, result}

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

  @spec start_scenario(Scenario.t) :: {:ok | :error, Scenario.t}
  defp start_scenario(%Scenario{} = scenario) do
    Scenario.run(%{scenario | folder: make_test_folder()})
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

  defp do_get_scenarios({module, func, args}) when is_atom(module) and is_atom(func) and is_list(args) do
    case apply(module, func, args) do
      [%Scenario{} |_] = scenarios -> scenarios
      other -> raise %Resemblixir.ScenarioConfigError{scenarios: other}
    end
  end
end
