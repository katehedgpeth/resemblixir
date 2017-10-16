defmodule Resemblixir.BreakpointTest do
  alias Resemblixir.{Breakpoint, Scenario, Compare, Paths, MissingReferenceError}
  use Resemblixir.ScenarioCase, async: true

  describe "run/3" do
    test "returns {:ok, %Compare{}} when images match", %{scenarios: [scenario]} do
      result = Breakpoint.run({:xs, 454}, scenario) 
      assert {:ok, {:xs, %Compare{raw_mismatch_percentage: 0, images: %{test: test_img}}}} = result
      assert File.exists?(test_img)
    end

    test "returns {:error, %Compare{}} when images do not match", %{scenarios: [scenario]} do
      assert {:error, {:xs, data}} = Breakpoint.run({:xs, 700}, scenario)
      assert is_binary(data.images.diff)
      assert data.dimension_difference.width == -238
    end

    test "returns {:error, %MissingReferenceError{}} when reference file is missing}", %{scenarios: [scenario], reference_folder: folder} do
      refute folder |> Paths.reference_file(Paths.file_name(scenario.name, :xl)) |> File.exists?()
      assert {:error, {:xl, %MissingReferenceError{}}} = Breakpoint.run({:xl, 1200}, scenario)
    end
  end

  describe "image paths" do
    @tag generate_scenarios: false
    test "for reference image", %{id: id, tests_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.ref_image_path(%Scenario{name: id, folder: folder}, :xs) ==
        Path.join([File.cwd!(), "priv", "resemblixir", "reference_images", [id, "_xs.png"]])
    end

    @tag generate_scenarios: false
    test "for test image", %{id: id, tests_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.test_image_path(%Scenario{name: id, folder: folder}, :xs)
        == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", ["test_", id], [id, "_xs.png"]])
    end
  end
end
