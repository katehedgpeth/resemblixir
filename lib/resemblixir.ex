defmodule Resemblixir do
  import Resemblixir.Helpers
  alias Resemblixir.{Pixel, Diff, Png}
  @moduledoc """
  image1
  |> diff(image2, opts)
  """

  @type path :: String.t
  @type opts :: Keyword.t

  @doc """
  TODO: docs
  """
  @spec diff(path, path, opts) :: :ok | {:error, Diff.t}
  def diff(img_1_path, img_2_path, opts) do
    img_1_path
    |> Png.decode()
    |> get_diff(Png.decode(img_2_path), opts)
    |> eval_diff({img_1_path, img_2_path})
  end

  def get_diff(image, image, _opts) do
    {:ok, %Diff{left: image, right: image}}
  end
  def get_diff(%Png{} = image_1, %Png{} = image_2, _opts) do
    image_1.chunks
    |> Enum.zip(image_2.chunks)
    |> Enum.reduce({:ok, {{image_1, image_2}, %Diff{}}}, &eval_pixel/2)
  end

  defp read_image(path) do
    path
    |> file_path()
    |> File.read!()
    |> to_pixels()
  end

  def eval_diff({:ok, {{_meta, _}, %Diff{}}}, {left, right}) do
    {:ok, file_path(left)}
  end
  def eval_diff({:error, %Diff{diff: diff_pixels}}, {_left, _right}) do
    diff = diff_pixels
    |> Enum.reduce([], &from_pixels/2)
    |> to_string()
    |> IO.inspect()
    |> write_diff()
    {:error, diff}
  end

  def eval_pixel({pixel, pixel}, {{}, %Diff{}}) do
    %Diff{}
  end

  def write_diff(binary) do
    "test_results"
    |> file_path()
    |> File.mkdir_p()
    |> do_write_diff(binary)
  end

  def do_write_diff(:ok, binary) do
    {:ok, file} = "test_results/result.jpg"
    |> file_path()
    |> IO.chardata_to_string()
    |> File.write!(binary)
    file

  end

  defp to_pixels(file) do
    for <<r::8, g::8, b::8 <- file>>, do: %Pixel{r: r, g: g, b: b}
  end

  def from_pixels(%Pixel{} = pixel, acc) do
    [pixel.r, pixel.g, pixel.b | acc]
  end
  # def from_pixels([%Pixel{}], acc) do
  #   [pixel.r, pixel.g, pixel.b | acc]
  # end
  def from_pixels([], diff_image) do
    diff_image
  end
end
