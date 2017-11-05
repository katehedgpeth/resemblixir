defmodule Resemblixir.Breakpoint do alias Resemblixir.{Scenario, Compare, Paths, Screenshot, MissingReferenceError}

  defstruct [:pid, :owner, :name, :width, :ref, :scenario, result: {:error, :not_finished}]
  @type result :: Compare.success | Compare.failure | {:error, :not_finished} | {:error, :timeout}
  @type t :: %__MODULE__{
    pid: pid,
    owner: pid,
    name: atom,
    width: integer,
    ref: String.t,
    scenario: Scenario.t,
    result: result
  }

  @spec run({name::atom, width::integer}, Scenario.t) :: __MODULE__.t
  @doc """
  Runs a single breakpoint asynchronously. The initial %Breakpoint{} struct will have {:error, :not_finished}. 
  Sends a message to the calling process with the result when the task is finished.
  """
  def run({breakpoint_name, breakpoint_width}, %Scenario{url: url, folder: "/" <> _} = scenario)
  when is_atom(breakpoint_name) and is_integer(breakpoint_width) and is_binary(url) do
    args = %__MODULE__{name: breakpoint_name,
                       width: breakpoint_width,
                       scenario: scenario,
                       ref: ref_image_path(scenario, breakpoint_name),
                       owner: self()}
    {:ok, pid} = GenServer.start_link(__MODULE__, args, name: server_name(scenario, breakpoint_name))
    %{args | pid: pid}
  end

  @doc """
  Awaits a breakpoint's results. Use as an alternative to listening for the result message in a separate process.
  """
  def await(task, timeout \\ 5000)
  def await(%__MODULE__{pid: nil}, _timeout) do
    {:error, :no_pid}
  end
  def await(%__MODULE__{pid: pid, result: {:error, :not_finished}} = task, timeout) when is_pid(pid) do
    receive do
      %__MODULE__{result: {:ok, %Compare{}}} = result -> result
      %__MODULE__{result: {:error, %Compare{}}} = result -> result
      %__MODULE__{result: {:error, %MissingReferenceError{}}} = result -> result
    after
      timeout ->
        send pid, :timeout
        %{task | result: {:error, :timeout}}
    end
  end

  @spec server_name(Scenario.t, atom) :: atom
  @doc false
  def server_name(%Scenario{name: name}, breakpoint_name) when is_atom(breakpoint_name) do
    name
    |> Macro.camelize()
    |> String.to_atom()
    |> Module.concat(breakpoint_name)
  end

  @spec init(__MODULE__.t) :: Compare.result
  def init(%__MODULE__{} = args) do
    args = %{args | pid: self()}
    send self(), :start
    {:ok, args}
  end

  def handle_info(:start, %__MODULE__{} = state) do
    if File.exists?(state.ref) do
      :ok = start(state)
      {:noreply, state}
    else
      error = %MissingReferenceError{path: state.ref, breakpoint: state.name}
      state = %{state | result: {:error, error}}
      if state.owner, do: send state.owner, state
      {:stop, :normal, state}
    end
  end
  def handle_info({:result, {:ok, %Compare{} = result}}, %__MODULE__{} = state) do
    state = %{state | result: {:ok, result}}
    if state.owner, do: send state.owner, state
    {:stop, :normal, state}
  end
  def handle_info({:result, {:error, %Compare{} = result}}, %__MODULE__{} = state) do
    state = %{state | result: {:error, result}}
    if state.owner, do: send state.owner, state
    {:stop, :normal, state}
  end
  def handle_info(:timeout, %__MODULE__{} = state) do
    state = %{state | result: {:error, :timeout}}
    {:stop, :normal, state}
  end
  def handle_info(message, state) do
    send state.owner, message
    {:noreply, state}
  end

  def start(%__MODULE__{name: name, width: width, ref: ref, scenario: %Scenario{} = scenario}) do
    scenario
    |> Screenshot.take({name, width})
    |> Compare.compare(scenario, name, ref)
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

  defp breakpoint_file_name(scenario_name, breakpoint_name) do
    scenario_name
    |> String.replace(" ", "_")
    |> String.downcase()
    |> Kernel.<>("_#{breakpoint_name}.png")
  end
end
