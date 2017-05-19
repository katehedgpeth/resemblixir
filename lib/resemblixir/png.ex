defmodule Resemblixir.Png do
  import Resemblixir.Helpers

  @signature <<0x89, ?P, ?N, ?G, 0x0D, 0x0A, 0x1A, 0x0A>>

  defmodule Chunk do
    defstruct [
      length: 0,
      type: 0,
      data: 0,
      crc: 0
    ]
  end

  defstruct [
    :path, :chrm, :last_updated, :gamma,
    width: 0,
    height: 0,
    length: 0,
    bit_depth: 0,
    color_type: 0,
    compression_method: 0,
    filter_method: 0,
    interlace_method: 0,
    crc: 0,
    chunks: []
  ]

  @spec signature() :: binary
  def signature(), do: @signature

  def decode(path) do
    path
    |> file_path()
    |> File.read!()
    |> do_decode(path)
  end

  defp do_decode(<<0x89, ?P, ?N, ?G, 0x0D, 0x0A, 0x1A, 0x0A,
                length :: 32, ?I, ?H, ?D, ?R, width :: 32, height :: 32,
                8, color_type, compression_method, filter_method,
                interlace_method, crc :: 32, chunks :: binary>>, path) do
    %__MODULE__{
      path: path,
      width: width,
      height: height,
      length: length,
      bit_depth: 8,
      color_type: color_type(color_type),
      compression_method: compression_method,
      filter_method: filter_method,
      interlace_method: interlace_method,
      crc: crc
    }
    |> decode_chunks(chunks)
  end
  defp do_decode(error) do
    raise "Png.decode/1 can only decode .png files!\n\n Received: \n #{inspect(error)}"
  end

  defp color_type(0), do: :grayscale
  defp color_type(2), do: :rgb
  defp color_type(3), do: :indexed
  defp color_type(4), do: :grayscale_a
  defp color_type(6), do: :rgb_a

  defp channel_bit_length(:grayscale, length), do: length        # 1 channel (gray)
  defp channel_bit_length(:rgb, length), do: length * 3          # 3 channels (r, g, b)
  defp channel_bit_length(:indexed, length), do: length          # 1 channel containing indices into a palette of colors
  defp channel_bit_length(:grayscale_a, length), do: length * 2  # 2 channels (gray & alpha)
  defp channel_bit_length(:rgb_a, length), do: length * 4        # 4 channels (r, g, b, a)

  def decode_chunks(%__MODULE__{color_type: :rgb_a} = acc, <<length :: 32, "IEND", data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | chunks: Enum.reverse(acc.chunks)}
  end
  def decode_chunks(%__MODULE__{color_type: :rgb_a} = acc, <<length :: 32, "tIME", data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | timestamp: data |> IO.binwrite() |> IO.inspect()}
    |> decode_chunks(remaining)
  end
  def decode_chunks(%__MODULE__{color_type: :rgb_a} = acc, <<length :: 32, "cHRM", data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | chrm: data |> IO.binwrite() |> IO.inspect()}
    |> decode_chunks(remaining)
  end
  def decode_chunks(%__MODULE__{color_type: :rgb_a} = acc, <<length :: 32, "gAMA", data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | gamma: data |> to_string() |> String.normalize() |> IO.inspect()}
    |> decode_chunks(remaining)
  end
  def decode_chunks(%__MODULE__{color_type: :rgb_a} = acc, <<length :: 32, _, data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | chunks: [data | acc.chunks]}
    |> decode_chunks(remaining)
  end


  defp chunk_type(<<"tIME">>), do: :timestamp |> IO.inspect()
  defp chunk_type(<<"cHRM">>), do: :chrm |> IO.inspect()
  defp chunk_type(<<"gAMA">>), do: :gamma |> IO.inspect()
  defp chunk_type(<<"IDAT">>), do: :image_data |> IO.inspect()
  defp chunk_type(<<"IEND">>), do: :end |> IO.inspect()
  defp chunk_type(type) do
    IO.inspect(type)
    type
  end

  defp parse_chunk(:image_data, acc, _data, remaining) do
    IO.inspect "image data"
    IO.inspect remaining
    decode_chunks(acc, remaining)
    acc
  end
  defp parse_chunk(:end, acc, _, _) do
    acc
  end
  defp parse_chunk(_, acc, _, "") do
    IO.inspect acc
  end
  defp parse_chunk(:unknown, acc, _data, remaining) do
    decode_chunks(acc, remaining)
  end
  defp parse_chunk(type, acc, data, remaining) do
    %{acc | chunks: [data | acc.chunks]}
  end
  defp parse_chunk(type, acc, data, remaining) when is_atom(type) do
    acc
    |> Map.put(type, data)
    |> decode_chunks(remaining)
  end

  def parse_chunk(acc, <<length :: 32, type :: size(32), data :: binary - size(length), crc :: 32, remaining :: binary>>) do
    %{acc | chunks: [%__MODULE__.Chunk{length: length, type: type, crc: crc, data: data} | acc.chunks]}
    |> decode_chunks(remaining)
  end
end
