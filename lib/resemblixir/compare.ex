defmodule Resemblixir.Compare do
  alias Resemblixir.Compare.{Diff, Png}
  alias Imagineer.Image.PNG, as: Ipng
  @moduledoc """
  image1
  |> diff(image2, opts)
  """

  @type path :: String.t
  @type opts :: Keyword.t

  @default_opts [
    build_diff_images: false
  ]

  def start_link() do
    GenServer.start_link(__MODULE__, [self()], [name: __MODULE__])
  end

  def init(args) do
    IO.inspect args
    {:ok, crawler_pid} = GenServer.start_link(Resemblixir.Crawl, [self()])
    {:ok, %{crawler: crawler_pid}}
  end

  def handle_cast(:start, %{crawler: crawler}) do
    GenServer.cast(crawler, :start)
    {:noreply, %{crawler: crawler}}
  end
  def handle_cast({:screenshot_ready, {name, breakpoint}}, state) do
    IO.inspect {name, breakpoint}
    {:noreply, state}
  end

  def handle_info(message, state) do
    IO.inspect message
    {:noreply, state}
  end
  def handle_info(message, state) do
    IO.inspect message
    {:noreply, state}
  end

  @doc """
  TODO: docs
  """
  @spec diff(path, path, opts) :: :ok | {:error, Diff.t}
  def diff(path_1, path_2, opts \\ @default_opts) do
    [path_1, path_2]
    |> Enum.map(&Png.decode/1)
    |> List.to_tuple()
    |> eval_diff(opts)
  end

  @spec eval_diff({Png.t, Png.t}, opts) :: {:ok, {Png.t, Png.t}} | {:error, Diff.t}
  defp eval_diff({%Png{image: %Ipng{data_content: content}},
                  %Png{image: %Ipng{data_content: content}}} = diff, _opts), do: {:ok, diff}
  defp eval_diff({left, right}, _opts) do
    {:error, {left, right}}
  end
end
