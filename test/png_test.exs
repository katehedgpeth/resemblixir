defmodule Resemblixir.PngTest do
  use ExUnit.Case, async: true
  import Resemblixir.Helpers, only: [file_path: 1]
  alias Resemblixir.Png

  @path "test/fixtures/same.png"

  describe "decode/1" do
    test "decodes a png" do
      assert %Png{} = Png.decode @path
    end

    test "identifies png chunk types" do
      png = Png.decode @path
      assert png.path == @path
      assert png.width == 280
      assert png.height == 210
      assert png.color_type == :rgb_a
      refute png.gamma
    end
  end
end
