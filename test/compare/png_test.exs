defmodule Resemblixir.Compare.PngTest do
  use ExUnit.Case, async: true
  alias Resemblixir.Compare.Png

  @path "test/fixtures/same.png"

  describe "decode/1" do
    test "decodes a png" do
      assert %Png{} = Png.decode @path
    end

    test "identifies png chunk types" do
      png = Png.decode(@path)
      assert png.path == File.cwd!() |> Path.join(@path)
      assert png.image.width == 280
      assert png.image.height == 210
      assert png.image.color_type == 6
    end
  end
end
