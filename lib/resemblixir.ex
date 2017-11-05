defmodule Resemblixir do
  use GenServer
  alias Resemblixir.{Scenario, Paths, Opts, NoScenariosError, ScenarioConfigError, UrlError}

  defstruct [:folder, :parent, passed: [], failed: [], in_progress: [], queue: [], opts: %Opts{}]

  @type t :: %__MODULE__{
    passed: [Scenario.t],
    failed: [Scenario.t],
    queue: [scenario_params],
    in_progress: [Scenario.t],
    folder: String.t,
    opts: Opts.t,
    parent: pid
  }

  @type scenario_params :: %{
    name: String.t,
    url: String.t,
    breakpoints: [breakpoint_params]
  }

  @type success :: __MODULE__.t
  @type error :: __MODULE__.t |
                 Resemblixir.TestFailure |
                 ScenarioConfigError |
                 NoScenariosError
  @type success_result :: {:ok, __MODULE__.t}
  @type error_result :: {:error, error}
  @type result :: success_result | error_result

  @type breakpoint_params :: {name::atom, width::integer}


  #  # TODO: result format options
  #  # TODO: &run!/2
  @spec run([map] | nil, Opts.t) :: {:ok, pid}
  def run(scenarios \\ nil, opts \\ %Opts{})
  def run(scenarios, opts) do
    {:ok, _pid} = GenServer.start_link(__MODULE__, {%__MODULE__{opts: opts, parent: self()}, scenarios})
  end

  @spec make_scenario(scenario_params, folder_name::String.t) :: Scenario.t
  defp make_scenario(scenario, folder) when is_list(scenario) or is_map(scenario) do
    scenario
    |> Enum.into(%{})
    |> Map.put(:folder, folder)
    |> Scenario.__struct__()
    |> make_breakpoints()
  end

  @spec make_breakpoints(Scenario.t) :: Scenario.t
  defp make_breakpoints(%Scenario{breakpoints: %{}} = scenario), do: scenario
  defp make_breakpoints(%Scenario{breakpoints: breakpoints} = scenario) do
    %{scenario | breakpoints: Enum.into(breakpoints, %{})}
  end

  def init({state, scenarios}) do
    Process.flag(:trap_exit, true)
    send self(), {:run, scenarios}
    {:ok, state}
  end

  @spec handle_info(:ready |
                   {:run, [scenario_params]} |
                   {:start_scenario, scenario_params} |
                   {:result, Scenario.t} |
                   :finish, t) :: {:noreply, t} | {:stop, :normal, t}
  def handle_info({:run, []}, %__MODULE__{} = state) do
    send state.parent, {:error, %NoScenariosError{}}
    {:noreply, state}
  end
  def handle_info({:run, nil}, %__MODULE__{} = state) do
    send self(), {:run, get_scenarios()}
    {:noreply, state}
  end
  def handle_info({:run, {:error, %ScenarioConfigError{} = error}}, %__MODULE__{} = state) do
    send state.parent, {:error, error}
    {:noreply, state}
  end
  def handle_info({:run, scenarios}, %__MODULE__{} = state) when is_list(scenarios) do
    send self(), :ready
    {:noreply, %{state | queue: Enum.map(scenarios, &make_scenario(&1, make_test_folder()))}}
  end

  def handle_info(:ready, %__MODULE__{queue: [], in_progress: []} = state) do
    send self(), :finish
    {:noreply, state}
  end
  def handle_info(:ready, %__MODULE__{} = state) do
    {to_start, queue} = case {length(state.in_progress), System.schedulers_online() * 2} do
      {in_progress, max} when in_progress < max ->
        Enum.split(state.queue, max - in_progress)
      {_, _} ->
        {[], state.queue}
    end
    for %Scenario{} = scenario <- to_start do
      send self(), {:start_scenario, scenario}
    end
    {:noreply, %{state | queue: queue}}
  end

  def handle_info({:start_scenario, %Scenario{} = scenario}, %__MODULE__{opts: opts} = state) do
    started = case Scenario.run(scenario, %{opts | parent: self()}) do
      {:ok, %Scenario{} = started} -> started
      {:error, error} ->
        send self(), {:result, {:error, error}}
        scenario
    end
    {:noreply, %{state | in_progress: [{String.to_atom(scenario.name), started} | state.in_progress]}}
  end

  def handle_info({:result, result}, %__MODULE__{} = state) do
    state = update_state(result, state)
    send self(), status_message(result, state.opts.raise_on_error?)
    {:noreply, state}
  end
  def handle_info(:finish, %__MODULE__{in_progress: [{_, %Scenario{} = scenario} | remaining]} = state) do
    terminate_scenario(scenario)
    send self(), :finish
    {:noreply, %{state | in_progress: remaining}}
  end
  def handle_info(:finish, %__MODULE__{in_progress: []} = state) do
    send state.parent, get_result(state)
    {:noreply, state}
  end

  def handle_info({:EXIT, _, :normal}, state) do
    {:noreply, state}
  end

  defp status_message(%Scenario{failed: failed}, true) when length(failed) > 0 do
    :finish
  end
  defp status_message({:error, %UrlError{}}, true) do
    :finish
  end
  defp status_message(_, _) do
    :ready
  end

  defp update_state({:error, %UrlError{} = error}, %__MODULE__{} = state) do
    {_, in_progress} = Keyword.pop(state.in_progress, String.to_atom(error.scenario.name))

    state
    |> Map.put(:in_progress, in_progress)
    |> do_update_state(error)
  end
  defp update_state(%Scenario{} = scenario, %__MODULE__{} = state) do
    if scenario.pid && Process.alive?(scenario.pid), do: GenServer.stop(scenario.pid)

    {_, in_progress} = Keyword.pop(state.in_progress, String.to_atom(scenario.name))

    state
    |> Map.put(:in_progress, in_progress)
    |> do_update_state(scenario)
  end
  defp do_update_state(%__MODULE__{} = state, %UrlError{} = error) do
    %{state | failed: [error | state.failed]}
  end
  defp do_update_state(%__MODULE__{} = state, %Scenario{failed: []} = scenario) do
    %{state | passed: [scenario | state.passed]}
  end
  defp do_update_state(%__MODULE__{} = state, %Scenario{failed: [_ | _]} = scenario) do
    %{state | failed: [scenario | state.failed]}
  end

  defp terminate_scenario(%Scenario{pid: nil}), do: :ok
  defp terminate_scenario(%Scenario{pid: pid}) do
    if Process.alive?(pid) do
      GenServer.stop(pid)
    end
  end

  defp get_result(%__MODULE__{failed: []} = state), do: {:ok, state}
  defp get_result(%__MODULE__{failed: [_ | _]} = state), do: {:error, %Resemblixir.TestFailure{passed: state.passed, failed: state.failed}}

  @spec make_test_folder() :: String.t
  def make_test_folder() do
    test_folder = Paths.new_test_name() |> Paths.test_dir()
    :ok = File.mkdir_p(test_folder)
    test_folder
  end

  def get_scenarios do
    case Application.get_env(:resemblixir, :scenarios) do
      "/" <> _ = json_path ->
        json_path
        |> File.read!()
        |> Poison.decode!(keys: :atoms!)
      list when is_list(list) -> list
      other -> {:error, %ScenarioConfigError{scenarios: other}}
    end
  end
end
