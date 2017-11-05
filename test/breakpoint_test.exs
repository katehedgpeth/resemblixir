defmodule Resemblixir.BreakpointTest do
  alias Resemblixir.{Breakpoint, Scenario, Compare, Paths, MissingReferenceError, TestHelpers}
  use Resemblixir.ScenarioCase, async: true

  describe "start/1" do
    test "sends {:ok, %Compare{}} when images match", %{scenarios: [scenario]} do
      args = %Breakpoint{scenario: scenario, name: :xs, width: 454, owner: self(), ref: Breakpoint.ref_image_path(scenario, :xs)}
      assert Breakpoint.start(args) == :ok
      assert_receive {:result, result}
      assert {:ok, %Compare{raw_mismatch_percentage: 0, images: %{diff: nil}}} = result
    end
    test "sends {:error, %Compare{}} when images do not match", %{scenarios: [scenario]} do
      args = %Breakpoint{scenario: scenario, name: :xs, width: 700, owner: self(), ref: Breakpoint.ref_image_path(scenario, :xs)}
      assert Breakpoint.start(args) == :ok
      assert_receive {:result, error}
      assert {:error, %Compare{dimension_difference: %{width: -238}, images: %{diff: <<_::binary>>}}} = error
    end
  end

  describe "run/3" do
    test "exits with {:ok, %Compare{}} when images match", %{scenarios: [scenario]} do
      assert %Breakpoint{pid: pid, result: {:error, :not_finished}, name: :xs, width: 454} = Breakpoint.run({:xs, 454}, scenario)
      assert is_pid(pid)
      assert_receive %Breakpoint{name: :xs, result: {:ok, %Compare{raw_mismatch_percentage: 0, images: %{test: test_img}}}}, 5_000
      assert File.exists?(test_img)
    end

    test "exits with {:error, %Compare{}} when images do not match", %{scenarios: [scenario]} do
      ref_image = Breakpoint.ref_image_path(scenario, :xs)
      assert File.exists?(ref_image)
      assert %Breakpoint{pid: pid, result: {:error, :not_finished}, name: :xs, width: 700} = Breakpoint.run({:xs, 700}, scenario)
      assert scenario |> Breakpoint.server_name(:xs) |> GenServer.whereis() == pid
      assert_receive %Breakpoint{name: :xs, result: {:error, %Compare{} = data}}, 5000
      assert is_binary(data.images.diff)
      assert Enum.member?([-238, 238], data.dimension_difference.width)
    end

    test "exits with {:error, %MissingReferenceError{}} when reference file is missing}", %{scenarios: [scenario], reference_folder: folder} do
      refute folder |> Paths.reference_file(Paths.file_name(scenario.name, :xl)) |> File.exists?()
      assert %Breakpoint{pid: pid, result: {:error, :not_finished}, name: :xl, width: 1200} = Breakpoint.run({:xl, 1200}, scenario)
      assert is_pid(pid)
      assert_receive %Breakpoint{name: :xl, result: {:error, %MissingReferenceError{}}}
    end
  end

  describe "await/1" do
    test "returns result when result happens within timeout", %{scenarios: [scenario]} do
      assert %Breakpoint{pid: pid, result: {:error, :not_finished}} = breakpoint = Breakpoint.run({:xs, 454}, scenario)
      assert is_pid(pid)
      assert %Breakpoint{result: {:ok, %Compare{}}} = Breakpoint.await(breakpoint)
      refute Process.alive?(pid)
    end

    test "returns {:error, :timeout} on timeout", %{scenarios: [scenario]} do
      assert %Breakpoint{pid: pid, result: {:error, :not_finished}} = breakpoint = Breakpoint.run({:xs, 454}, scenario)
      assert is_pid(pid)
      assert %Breakpoint{result: {:error, :timeout}} = Breakpoint.await(breakpoint, 100)
    end
  end

  describe "image paths" do
    @tag generate_scenarios: false
    test "for reference image", %{test: name, tests_folder: tests_folder} do
      id = TestHelpers.scenario_name(name, 1)
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.ref_image_path(%Scenario{name: id, folder: folder}, :xs) ==
        Path.join([File.cwd!(), "priv", "resemblixir", "reference_images", [id, "_xs.png"]])
    end

    @tag generate_scenarios: false
    test "for test image", %{test: name, tests_folder: tests_folder} do
      id = TestHelpers.scenario_name(name, 1)
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.test_image_path(%Scenario{name: id, folder: folder}, :xs)
        == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", ["test_", id], [id, "_xs.png"]])
    end
  end
end
