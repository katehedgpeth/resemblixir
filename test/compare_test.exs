defmodule Resemblixir.CompareTest do
  alias Resemblixir.{Compare, Scenario}
  use ExUnit.Case, async: true
  setup_all do
    test_img_folder = Path.join([Application.app_dir(:resemblixir), "priv"])
    ref_image = Path.join([test_img_folder, "img_1.png"])
    test_image = Path.join([test_img_folder, "img_2.png"])
    case {{ref_image, File.exists?(ref_image)}, {test_image, File.exists?(test_image)}} do
      {{^ref_image, true}, {^test_image, true}} -> {:ok, test: test_image, ref: ref_image}
      error -> {:error, error}
    end
  end

  describe "compare/1" do
    test "returns {:error, %Compare{} when files do not match", %{test: test, ref: ref} do
      assert {:error, %Compare{}} = Compare.compare(test, %Scenario{name: "test_2"}, :xs, ref)
    end

    test "returns {:ok, %Compare{}} when files match", %{test: test} do
      assert {:ok, %Compare{}} = Compare.compare(test, %Scenario{name: "test_3"}, :xs, test)
    end
  end

  describe "open_port" do
    test "successfully runs an image analysis", %{test: test, ref: ref} do
      assert File.exists? Compare.compare_js()
      assert port = Compare.open_port(test, ref)
      assert_receive {^port, {:data, data}}, 5_000
      assert {:ok, %{isSameDimensions: _, dimensionDifference: _, rawMisMatchPercentage: _, misMatchPercentage: _}} = Poison.decode(data, keys: :atoms)
      case Port.info(port) do
        nil -> :ok
        _ -> assert Port.close(port) == true
      end
    end
  end
end
