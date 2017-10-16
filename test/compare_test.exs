defmodule Resemblixir.CompareTest do
  alias Resemblixir.{Compare, Scenario, Screenshot}
  use ExUnit.Case, async: true
  setup_all do
    test_img_folder = Path.join([Application.app_dir(:resemblixir), "priv"])
    ref_image = Path.join([test_img_folder, "454x444.png"])
    test_image = Path.join([test_img_folder, "686x459.png"])
    case {{ref_image, File.exists?(ref_image)}, {test_image, File.exists?(test_image)}} do
      {{^ref_image, true}, {^test_image, true}} -> {:ok, test: test_image, ref: ref_image, folder: test_img_folder}
      error -> {:error, error}
    end
  end

  describe "compare/1" do
    test "returns {:error, %Compare{} when files do not match", %{test: test, ref: ref} do
      assert {:error, %Compare{}} = Compare.compare(%Screenshot{path: test}, %Scenario{name: "test_2"}, :xs, ref)
    end

    test "generates a diff when files are different size", %{test: test, ref: ref} do
      assert {:error, %Compare{images: %{diff: diff_path}}} = Compare.compare(%Screenshot{path: test}, %Scenario{name: "test_3"}, :xs, ref)
      assert is_binary(diff_path)
      assert File.exists?(diff_path)
    end

    test "generates a diff when files are same size but don't match", %{ref: ref, folder: folder} do
      test_img = Path.join([folder, "454x444_2.png"])
      assert File.exists?(test_img)
      assert {:error, %Compare{images: %{diff: diff_path}}} = Compare.compare(%Screenshot{path: test_img}, %Scenario{name: "test_4"}, :xs, ref)
      assert is_binary(diff_path)
      assert File.exists?(diff_path)
    end 

    test "returns {:ok, %Compare{}} when files match", %{test: test} do
      assert {:ok, %Compare{}} = Compare.compare(%Screenshot{path: test}, %Scenario{name: "test_4"}, :xs, test)
    end
  end

  describe "open_port" do
    test "successfully runs an image analysis", %{test: test, ref: ref} do
      assert File.exists? Compare.compare_js()
      assert {result, 0} = Compare.open_port(test, ref)
      assert {:ok, %{diff: _, data: %{isSameDimensions: _, dimensionDifference: _, rawMisMatchPercentage: _, misMatchPercentage: _}}} = Poison.decode(result, keys: :atoms)
    end
  end
end
