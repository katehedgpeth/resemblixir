defmodule Resemblixir.BreakpointTest do
  alias Resemblixir.{Breakpoint, Scenario, Compare, Paths, TestHelpers}
  use ExUnit.Case, async: true

  setup do
    ref_folder = Paths.reference_image_dir()
    :ok = File.mkdir_p(ref_folder)
    tests_folder = Paths.tests_dir()
    :ok = File.mkdir_p(tests_folder)
    bypass = Bypass.open()
    Bypass.expect bypass, fn conn ->
      Plug.Conn.resp(conn, 200, TestHelpers.html(1))
    end
    id = [:positive] |> System.unique_integer() |> Integer.to_string()

    scenario_name = "scenario_" <> id
    test_name = Paths.new_test_name()
    test_folder = Path.join([tests_folder, test_name])
    assert test_folder == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", test_name])
    assert :ok = File.mkdir_p(test_folder)

    scenario = %Scenario{
      name: scenario_name,
      breakpoints: [xs: 454],
      folder: test_folder,
      url: "http://localhost:" <> Integer.to_string(bypass.port)
    }
    assert {:xs, ref_img} = Resemblixir.References.generate_breakpoint({:xs, 454}, scenario)
    assert File.exists?(ref_img)

    on_exit fn ->
      assert {:ok, _} = File.rm_rf(test_folder)
      assert :ok = File.rm(ref_img)
    end

    {:ok, tests_folder: tests_folder, reference_folder: ref_folder, id: id, scenario: scenario}
  end

  describe "run/3" do
    test "returns {:ok, %Compare{}} when images match", %{scenario: scenario} do
      result = Breakpoint.run({:xs, 454}, scenario, self()) 
      assert_receive ^result
      assert {:ok, {:xs, %Compare{raw_mismatch_percentage: 0, images: %{test: test_img}}}} = result
      assert File.exists?(test_img)
    end
  end

  describe "image paths" do
    test "for reference image", %{id: id, tests_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.ref_image_path(%Scenario{name: id, folder: folder}, :xs) ==
        Path.join([File.cwd!(), "priv", "resemblixir", "reference_images", [id, "_xs.png"]])
    end

    test "for test image", %{id: id, tests_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.test_image_path(%Scenario{name: id, folder: folder}, :xs)
        == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", ["test_", id], [id, "_xs.png"]])
    end
  end
end
