defmodule Resemblixir.Scenario do
  use GenServer
  alias Resemblixir.{Breakpoint, Paths, Compare, MissingReferenceError}
  defstruct [:name, :url, :breakpoints, :folder, passed: [], failed: []]

  @type t :: %__MODULE__{
    url: String.t,
    breakpoints: Keyword.t,
    folder: String.t,
    passed: [Compare.t],
    failed: [Compare.t]
  }

  def run(%__MODULE__{breakpoints: breakpoints, name: name, url: url, folder: "/" <> _ = folder} = scenario, parent)
  when is_binary(name) and is_binary(url) and is_list(breakpoints) and length(breakpoints) > 0 do
    {:ok, pid} = GenServer.start_link(__MODULE__, {scenario, parent})
  end 

  def init({%__MODULE__{} = scenario, parent}) do
    send self(), :start
    {:ok, {scenario, parent, Enum.map(scenario.breakpoints, fn {name, _width} ->
      {name, :not_finished}
    end)}}
  end

  def handle_info(:start, {%__MODULE__{} = scenario, parent, remaining}) do
    Enum.each(scenario.breakpoints, fn {name, width} ->
      send self(), {:start_breakpoint, {name, width}} 
    end)
    {:noreply, {scenario, parent, remaining}}
  end

  def handle_info({:start_breakpoint, breakpoint}, {scenario, parent, remaining}) do
    Task.start_link(Breakpoint, :run, [breakpoint, scenario, self()])
    {:noreply, {scenario, parent, remaining}}
  end

  def handle_info({:ok, {breakpoint,  %Compare{breakpoint: breakpoint} = result}}, {scenario, parent, remaining}) do
    scenario = %{scenario | passed: [{breakpoint, result} | scenario.passed]}
    maybe_stop_process({scenario, parent, remaining}, breakpoint)
  end

  def handle_info({:error, {breakpoint, error}}, {scenario, parent, remaining}) do
    send parent, {:error, scenario, {breakpoint, error}}
    scenario = %{scenario | failed: [{breakpoint, error} | scenario.failed]}
    maybe_stop_process({scenario, parent, remaining}, breakpoint)
  end

  def handle_info({:DOWN, _ref, :process, _pid, :normal}, state) do
    {:noreply, state}
  end
  def handle_info({:EXIT, _ref, :process, _pid, :normal}, state) do
    {:noreply, state}
  end
  
  def maybe_stop_process({scenario, parent, remaining}, breakpoint) do
    case {Keyword.pop_first(remaining, breakpoint), scenario.failed} do
      {{_, []}, []} ->
        {:stop, :normal, {scenario, parent, []}}
      {{_, []}, failed} when length(failed) > 0 ->
        {:stop, :normal, {scenario, parent, []}}
      {{_, unfinished}, _} ->
        {:noreply, {scenario, parent, unfinished}}
    end
  end

  def terminate(:normal, {%__MODULE__{failed: []} = scenario, parent, []}) do
    send parent, {:ok, scenario}
  end
  def terminate(:normal, {scenario, parent, []}) do
    send parent, {:error, scenario}
  end

  defp finish(%__MODULE__{failed: []} = scenario), do: {:ok, scenario}
  defp finish(%__MODULE__{} = scenario), do: {:error, scenario}
end
