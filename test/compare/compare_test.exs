defmodule Resemblixir.CompareTest do
  use ExUnit.Case
  alias Resemblixir.Compare
  alias Resemblixir.Compare.Png
  doctest Resemblixir.Compare

  @same_1 "test/fixtures/same_1.png"
  @same_2 "test/fixtures/same_2.png"
  @different "test/fixtures/different.png"

  describe "diff/2" do
    test "returns {:ok, {%Png{}, %Png{}}} when images are identical" do
      assert {:ok, {%Png{}, %Png{}}} = Compare.diff(@same_1, @same_2)
    end

    test "returns {:error, {%Png{}, %Png{}}} when images are not identical" do
      assert {:error, {%Png{}, %Png{}}} = Compare.diff(@same_1, @different, [])
    end
  end
end
