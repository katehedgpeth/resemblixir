defmodule Resemblixir.Compare.Png do
  alias Resemblixir.Compare.Png.{Text, DataContent}
  alias Imagineer.Image.PNG.Chunk

  @signature <<0x89, ?P, ?N, ?G, 0x0D, 0x0A, 0x1A, 0x0A>>

  defstruct [:path, :image]

  @spec signature() :: binary
  def signature(), do: @signature

  def decode(path) do
    path
    |> file_path()
    |> File.read!()
    |> remove_signature()
    |> decode_chunks(%__MODULE__{path: file_path(path), image: %Imagineer.Image.PNG{}})
  end

  def file_path(path) do
    File.cwd!()
    |> Path.join(path)
  end

  defp remove_signature(<<@signature, rest::binary>>), do: rest
  defp remove_signature(error) do
    raise "Png.decode/1 can only decode .png files!\n\n Received: \n #{inspect(error)}"
  end

  defp decode_chunks(<<length :: 32, "IEND", _::binary>>, %__MODULE__{} = image) do
    image
  end
  defp decode_chunks(<<length :: 32,
                       type :: binary-size(4),
                       data :: binary-size(length),
                       crc :: size(32),
                       remaining :: binary>>, image) do
    case Chunk.decode(type, data, crc, image.image) do
      {:end, finished_image} -> %{image | image: finished_image}
      in_process_image -> decode_chunks(remaining, %{image | image: in_process_image})
    end
  end
end
