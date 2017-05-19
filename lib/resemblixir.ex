defmodule Resemblixir do
  alias Resemblixir.{Pixel, Diff}
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
    |> read_image()
    |> get_diff(read_image(img_2_path), opts)
  end

  def get_diff([%Pixel{}|_] = image_1, [%Pixel{}|_] = image_2, _opts)
  when length(image_1) == length(image_2) do
    image_1
    |> Enum.zip(image_2)
    |> Enum.reduce({:ok, %Diff{}}, &eval_pixel/2)
    |> eval_diff
  end
  def get_diff(_image_1, _image_2, _opts) do
    {:error, :error}
  end

  defp read_image(path) do
    File.cwd!()
    |> Path.join("priv")
    |> Path.join(path)
    |> File.read!()
    |> to_pixels()
  end

  defp to_pixels(file) do
    for <<r::8, g::8, b::8 <- file>>, do: %Pixel{r: r, g: g, b: b}
  end

  def eval_pixel({%Pixel{} = pixel, %Pixel{} = pixel}, {_, acc}) do
    {:ok, %Diff{diff: [pixel | acc.diff], left: [pixel | acc.left], right: [pixel | acc.right]}}
  end
  def eval_pixel({%Pixel{} = pixel_1, %Pixel{} = pixel_2}, {_, acc}) do
    {:error, %Diff{diff: [%Pixel{}|acc.diff], left: [pixel_1 | acc.left], right: [pixel_2 | acc.right]}}
  end

  def eval_diff(diff), do: diff
end
