defmodule Resemblixir.BreakpointTest do
  alias Resemblixir.{Breakpoint, Scenario, Compare, Paths, TestHelpers}
  use ExUnit.Case, async: true

  setup_all do
    ref_folder = Paths.reference_image_dir()
    :ok = File.mkdir_p(ref_folder)
    test_folder = Paths.tests_dir()
    :ok = File.mkdir_p(test_folder)
    {:ok, test_folder: test_folder, reference_folder: ref_folder}
  end

  setup do
    {:ok, test_name: Paths.new_test_name(), id: [:positive] |> System.unique_integer() |> Integer.to_string()}
  end


  describe "run/3" do
    test "returns {:ok, %Compare{}} when images match", %{id: id, test_folder: test_folder} do
      
      bypass = Bypass.open()
      Bypass.expect bypass, fn conn ->
        Plug.Conn.resp(conn, 200, TestHelpers.html(1))
      end

      scenario_name = "scenario_" <> id
      test_name = Paths.new_test_name()
      test_folder = Path.join([test_folder, test_name])
      assert test_folder == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", test_name])

      scenario = %Scenario{
        name: scenario_name,
        breakpoints: [xs: 454],
        folder: test_folder,
        url: "http://localhost:" <> Integer.to_string(bypass.port)
      }
      assert {:xs, ref_img} = Resemblixir.References.generate_breakpoint({:xs, 454}, scenario)
      assert File.exists?(ref_img)

      assert :ok = File.mkdir(test_folder)

      result = Breakpoint.run({:xs, 454}, scenario, self()) 
      assert_receive ^result
      assert {:ok, {:xs, %Compare{raw_mismatch_percentage: 0, images: %{test: test_img}}}} = result
      assert File.exists?(test_img)
      assert {:ok, _} = File.rm_rf(test_folder)
      assert :ok = File.rm(ref_img)
    end
  end

  describe "image paths" do
    test "for reference image", %{id: id, test_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.ref_image_path(%Scenario{name: id, folder: folder}, :xs) ==
        Path.join([File.cwd!(), "priv", "resemblixir", "reference_images", [id, "_xs.png"]])
    end

    test "for test image", %{id: id, test_folder: tests_folder} do
      folder = Path.join([tests_folder, "test_" <> id])
      assert Breakpoint.test_image_path(%Scenario{name: id, folder: folder}, :xs)
        == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", ["test_", id], [id, "_xs.png"]])
    end
  end
end
