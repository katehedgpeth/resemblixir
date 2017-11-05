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
    test "sends {:error, %Compare{}} and generates a diff when files are different size", %{test: test, ref: ref} do
      assert :ok = Compare.compare(%Screenshot{path: test}, %Scenario{name: "test_3"}, :xs, ref)
      assert_receive {:result, {:error, %Compare{images: %{diff: diff_path}}}}, 1000
      assert is_binary(diff_path)
      assert File.exists?(diff_path)
      assert :ok = File.rm(diff_path)
    end

    test "sends {:error, %Compare{}} and generates a diff when files are same size but don't match", %{ref: ref, folder: folder} do
      test_img = Path.join([folder, "454x444_2.png"])
      assert File.exists?(test_img)
      assert :ok = Compare.compare(%Screenshot{path: test_img}, %Scenario{name: "test_4"}, :xs, ref)
      assert_receive {:result, {:error, %Compare{images: %{diff: diff_path}}}}, 1000
      assert is_binary(diff_path)
      assert File.exists?(diff_path)
      assert :ok = File.rm(diff_path)
    end

    test "sends {:ok, %Compare{}} when files match", %{test: test} do
      assert :ok = Compare.compare(%Screenshot{path: test}, %Scenario{name: "test_4"}, :xs, test)
      assert_receive {:result, {:ok, %Compare{images: %{diff: diff}, dimension_difference: dims, raw_mismatch_percentage: raw_mismatch, mismatch_percentage: mismatch}}}, 100
      assert mismatch == "0.00"
      assert raw_mismatch == 0
      assert dims == %{width: 0, height: 0}
      assert diff == nil
    end
  end
end
