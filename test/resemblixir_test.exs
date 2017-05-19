defmodule ResemblixirTest do
  use ExUnit.Case
  alias Resemblixir.Diff
  doctest Resemblixir

  @same "test/fixtures/same.png"
  @different "test/fixtures/different.png"

  describe "diff/2" do
    test "returns {:ok, image_path} when images are identical" do
      assert Resemblixir.diff(@same, @same, []) == {:ok, File.cwd!()
                                                       |> Path.join("test")
                                                       |> Path.join("fixtures")
                                                       |> Path.join("same.png")}
    end

    test "returns {:error, %Diff{}} when images are not identical" do
      assert {:error, file} = Resemblixir.diff(@same, @different, [])
      refute file
    end
  end
end
