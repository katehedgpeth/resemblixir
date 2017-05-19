defmodule Resemblixir.Encoder do
  alias Resemblixir.Pixel

  @signature
  def encode(%Pixel{}) do

    data = <<Png.signature() :: binary>>
    {:ok, data}
  end
end
