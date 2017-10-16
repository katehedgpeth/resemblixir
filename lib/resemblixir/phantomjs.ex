defmodule Resemblixir.PhantomJs do
  #  use GenServer
  #  @js_file Path.join([Application.app_dir(:resemblixir), "priv", "take_screenshot.js"])
  #
  #  defstruct [:port, queued: [], awaiting: %{}]
  #
  #  def start_link(_ \\ []) do
  #    case GenServer.start_link(__MODULE__, [], name: __MODULE__) do
  #      {:ok, pid} -> {:ok, pid}
  #      {:error, {:already_started, pid}} -> {:ok, pid}
  #    end
  #  end
  #
  #  def init(_) do
  #    IO.inspect "starting new phantom instance"
  #    send self(), :next
  #    {:ok, %__MODULE__{}}
  #  end
  #
  #  def queue(path, url, width) when is_binary(path) and is_binary(url) and is_integer(width) do
  #    GenServer.call(__MODULE__, {:queue, {path, url, width}}, :infinity)
  #  rescue
  #    error -> {:error, error}
  #  end
  #
  #  def handle_call({:queue, {path, url, width}}, from, %__MODULE__{} = state) do
  #    queued = Enum.reverse([{path, url, width, from} | Enum.reverse(state.queued)])
  #    {:noreply, %{state | queued: queued}}
  #  end
  #
  #  def handle_call(:queue_length, _from, %__MODULE__{} = state) do
  #    {:reply, length(state.queued), state}
  #  end
  #
  #  def handle_info(:next, %__MODULE__{queued: [{path, url, width, from} | remaining]} = state) do
  #    port = get_screenshot(width, url, path)
  #    {:noreply, %{state | queued: remaining, awaiting: Map.put(state.awaiting, port, from)}}
  #  end
  #  def handle_info(:next, %__MODULE__{queued: []} = state) do
  #    send self(), :next
  #    {:noreply, state}
  #  end
  #
  #  def handle_info({port, {:data, "phantomjs> "}}, state), do: {:noreply, state}
  #  def handle_info({port, {:data, "undefined\n"}}, state), do: {:noreply, state}
  #  def handle_info({port, {:data, data}}, %__MODULE__{awaiting: awaiting} = state) do
  #    case Poison.decode(data, keys: :atoms!) do
  #      {:ok, %{path: path} = parsed} ->
  #        remaining = send_reply(awaiting, parsed, port)
  #        send self(), :next
  #        {:noreply, %{state | awaiting: remaining}}
  #      _ ->
  #        {:noreply, state}
  #    end
  #  end
  #
  #  defp get_screenshot(width, url, path) do
  #    opts = [:binary, :stderr_to_stdout, :use_stdio, args: [@js_file, path, url, Integer.to_string(width)]]
  #    Port.open({:spawn_executable, System.find_executable("phantomjs")}, opts)
  #  end
  #
  #  defp send_reply(awaiting, result, port) do
  #    awaiting
  #    |> Map.pop(port)
  #    |> do_send_reply({:ok, result}, port)
  #  end
  #
  #  defp do_send_reply({{pid, _ref} = from, remaining}, result, port) when is_pid(pid) do
  #    GenServer.reply(from, result)
  #    kill_port(port)
  #    remaining
  #  end
  #
  #  defp kill_port(port) do
  #    port
  #    |> Port.info()
  #    |> do_kill_port()
  #  end
  #
  #  defp do_kill_port(nil), do: :ok
  #  defp do_kill_port(port_info) do
  #    System.cmd("kill", ["-9", Integer.to_string(port_info[:os_pid])])
  #  end
end
