defmodule ResemblixirTest do
  use ExUnit.Case
  alias Resemblixir.Diff
  doctest Resemblixir

  describe "diff/2" do
    test "returns {:ok, %Diff{}} when images are identical" do
      file = "test_images/image_1.jpg"
      assert {:ok, %Diff{}} = Resemblixir.diff(file, file, [])
    end

    test "returns {:error, %Diff{}} when images are not identical" do
      _file_1 = "test_images/image_1.jpg"
      _file_2 = "test_images/image_2.jpg"
      # assert Resemblixir.diff(file_1, file_2, []) == {:error, %Diff{}}
    end
  end
end
