defmodule Resemblixir.Diff do
  alias Resemblixir.Pixel

  @type t :: %__MODULE__{
    diff: [Pixel.t],
    left: [Pixel.t],
    right: [Pixel.t]
  }
  defstruct [diff: [], left: [], right: []]
end
