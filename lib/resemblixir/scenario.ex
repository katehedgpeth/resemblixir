defmodule Resemblixir.Scenario do
  use Supervisor
  alias Resemblixir.{Breakpoint, Compare, Opts, MissingReferenceError}
  defstruct [:name, :url, :breakpoints, :folder, :parent, :pid, status_code: 200, passed: [], failed: [], not_run: [], tasks: []]

  @type t :: %__MODULE__{
    parent: pid,
    pid: pid,
    url: String.t,
    breakpoints: Keyword.t,
    status_code: integer,
    folder: String.t,
    tasks: [],
    passed: [Breakpoint.t],
    failed: [Breakpoint.t],
    not_run: [Breakpoint.t]
  }
  @type state :: {__MODULE__.t, Opts.t}
  @type success :: {:ok, __MODULE__.t}
  @type failure :: {:error, __MODULE__.t | Resemblixir.UrlError.t}

  @spec run(__MODULE__.t, Opts.t) :: success | failure
  def run(%__MODULE__{status_code: code,
                      breakpoints: %{},
                      name: <<_::binary>>,
                      url: <<url::binary>>,
                      folder: "/" <> _} = scenario, %Opts{} = opts)
                      when is_integer(code) do
    with {:ok, %HTTPoison.Response{status_code: ^code}} <- HTTPoison.get(url) do
      scenario = %{scenario | parent: self()}
      {:ok, pid} = GenServer.start_link(__MODULE__, {scenario, opts})
      {:ok, %{scenario | pid: pid}}
    else
      {:error, error} ->
        {:error, %Resemblixir.UrlError{scenario: scenario, error: error}}
    end
  end

  def init({%__MODULE__{breakpoints: breakpoints} = scenario, %Opts{} = opts}) do
    for breakpoint <- breakpoints do
      send self(), {:start_breakpoint, breakpoint}
    end
    {:ok, {scenario, opts}}
  end

  def handle_info({:start_breakpoint, {name, width}}, {%__MODULE__{tasks: tasks} = scenario, opts}) do
    task = %Breakpoint{} = Breakpoint.run({name, width}, scenario)
    scenario = %{scenario | tasks: [{name, task} | tasks]}
    {:noreply, {scenario, opts}}
  end
  def handle_info(%Breakpoint{result: {:ok, %Compare{}}} = result, {scenario, opts}) do
    result
    |> update_scenario(scenario)
    |> maybe_stop(opts)
  end
  def handle_info(%Breakpoint{result: {:error, _}} = result, {scenario, opts}) do
    result
    |> update_scenario(scenario)
    |> maybe_stop(opts)
  end
  def handle_info(:finish, {scenario, opts}) do
    scenario = scenario.tasks
    |> Keyword.values()
    |> Enum.reduce(scenario, &update_scenario/2)
    send scenario.parent, {:result, scenario}
    {:noreply, {scenario, opts}}
  end

  @spec update_scenario(Breakpoint.t, __MODULE__.t) :: __MODULE__.t
  defp update_scenario(%Breakpoint{name: name} = breakpoint, %__MODULE__{} = scenario) do
    {_, remaining} = Keyword.pop(scenario.tasks, name)
    scenario
    |> Map.put(:tasks, remaining)
    |> do_update_scenario(%{breakpoint | scenario: nil})
  end

  defp do_update_scenario(%__MODULE__{} = scenario, %Breakpoint{result: {:ok, %Compare{}}} = breakpoint) do
    %{scenario | passed: [breakpoint | scenario.passed]}
  end
  defp do_update_scenario(%__MODULE__{} = scenario, %Breakpoint{result: {:error, %Compare{}}} = breakpoint) do
    %{scenario | failed: [breakpoint | scenario.failed]}
  end
  defp do_update_scenario(%__MODULE__{} = scenario, %Breakpoint{result: {:error, %MissingReferenceError{}}} = breakpoint) do
    %{scenario | failed: [breakpoint | scenario.failed]}
  end
  defp do_update_scenario(%__MODULE__{} = scenario, %Breakpoint{result: :not_run} = breakpoint) do
    %{scenario | not_run: [breakpoint | scenario.not_run]}
  end

  defp do_update_scenario(%__MODULE__{} = scenario, message) do
    %{scenario | failed: [message | scenario.failed]}
  end

  @spec maybe_stop(__MODULE__.t, Opts.t) :: {:noreply, state} | {:stop, :normal, state}
  defp maybe_stop(%__MODULE__{tasks: [], failed: []} = scenario, opts) do
    # all breakpoints finished, no failures
    send self(), :finish
    {:noreply, {scenario, opts}}
  end
  defp maybe_stop(%__MODULE__{tasks: []} = scenario, opts) do
    # all breakpoints finished, some failures
    send self(), :finish
    {:noreply, {scenario, opts}}
  end
  defp maybe_stop(%__MODULE__{failed: [_|_]} = scenario, %Opts{raise_on_error: true} = opts) do
    # there is an error and we want to raise on any error --
    # stop all the other tasks, which will eventually trigger pattern #2
    send self(), :finish
    {:noreply, {scenario, opts}}
  end
  defp maybe_stop(%__MODULE__{} = scenario, %Opts{} = opts) do
    # tasks remaining
    {:noreply, {scenario, opts}}
  end
end
