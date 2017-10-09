defmodule Resemblixir do
  use GenServer
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
    raise %Resemblixir.NoTestsError{}
  end
  def run([%Scenario{} | _] = scenarios, opts) do
    {:ok, pid} = GenServer.start_link(__MODULE__, {scenarios, self()})
    if opts[:async] == true do
      {:ok, pid}
    else
      await_result()
    end
  end

  defp await_result() do
    receive do
      {:ok, scenarios} -> {:ok, scenarios}
      {:error, scenarios} -> {:error, scenarios}
    end
  end

  @impl true
  def init({scenarios, parent}) do
    Process.flag :trap_exit, true
    send self(), :start
    {:ok, {Enum.map(scenarios, &{String.to_atom(&1.name), &1}), parent, %__MODULE__{}}} 
  end

  @impl true
  def handle_info(:start, {scenarios, parent, result}) do
    Enum.each(scenarios, fn {_, scenario} -> send self(), {:start_scenario, scenario} end)
    {:noreply, {scenarios, parent, result}}
  end

  def handle_info({:start_scenario, scenario}, {scenarios, parent, result}) do
    scenario = %{scenario | folder: make_test_folder()} 
    {:ok, pid} = Scenario.run(scenario, self())
    {:noreply, {Keyword.put(scenarios, String.to_atom(scenario.name), pid), parent, result}}
  end

  def handle_info({:ok, %Scenario{} = scenario}, {scenarios, parent, result}) do
    result = %{result | passed: [scenario | result.passed]}
    {_, remaining} = Keyword.pop(scenarios, String.to_atom(scenario.name))
    maybe_finish_process({remaining, parent, result})
  end

  def handle_info(message, {scenarios, parent, result}) do
    IO.inspect message, label: "unexpected message in Resemblixir"
    {:noreply, {scenarios, parent, result}}
  end

  defp maybe_finish_process({[], parent, %__MODULE__{failed: []} = result}) do
    # all scenarios have run and there are no errors
    send parent, {:ok, result}
    {:stop, :normal, {[], parent, result}}
  end
  defp maybe_finish_process({[], parent, result}) do
    # all scenarios have run but errors exist
    send parent, {:error, result}
    {:stop, :normal, {[], parent, result}}
  end
  defp maybe_finish_process({remaining, parent, result}) do
    # other scenarios still need to finish
    {:noreply, {remaining, parent, result}}
  end

  @impl true
  def terminate(:normal, _state), do: :ok

  defp make_test_folder() do
    test_folder = Paths.new_test_name()
                  |> Paths.test_dir()
    :ok = File.mkdir_p(test_folder)
    test_folder
  end

  def get_scenarios do
    case Application.get_env(:resemblixir, :scenarios) do
      [%Scenario{} | _] = scenarios -> scenarios
      {module, func, args} -> do_get_scenarios({module, func, args})
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
