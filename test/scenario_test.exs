defmodule Resemblixir.ScenarioTest do
  alias Resemblixir.{Paths, Scenario, TestHelpers, Compare}
  use ExUnit.Case, async: true

  setup_all do
    ref_folder = Paths.reference_image_dir()
    :ok = File.mkdir_p(ref_folder)
    tests_folder = Paths.tests_dir()
    :ok = File.mkdir_p(tests_folder)
    test_folder = Paths.new_test_name()
    id = [:positive]
         |> System.unique_integer()
         |> Integer.to_string()
    scenario_name = "scenario_" <> id
    test_name = Paths.new_test_name()
    test_folder = Path.join([tests_folder, test_name])
    assert test_folder == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", test_name])
    assert :ok = File.mkdir(test_folder)

    bypass = Bypass.open()
    Bypass.expect bypass, fn conn ->
      Plug.Conn.resp(conn, 200, TestHelpers.html(1))
    end

    scenario = %Scenario{
      name: scenario_name,
      breakpoints: [xs: 454],
      folder: test_folder,
      url: "http://localhost:" <> Integer.to_string(bypass.port)
    }
    assert {:xs, ref_img} = Resemblixir.References.generate_breakpoint({:xs, 454}, scenario)
    assert File.exists?(ref_img)

    on_exit fn ->
      assert :ok = File.rm ref_img
      assert {:ok, _} = File.rm_rf test_folder
    end
    {:ok, scenario: scenario}
  end

  describe "run/1" do
    test "runs a single scenario", %{scenario: scenario} do

      bypass = Bypass.open()
      Bypass.expect bypass, fn conn ->
        Plug.Conn.resp(conn, 200, TestHelpers.html(1))
      end

      assert {:ok, pid} = Scenario.run(%{scenario | url: "http://localhost:" <> Integer.to_string(bypass.port)}, self())
      assert is_pid(pid)
      assert_receive {:ok, %Scenario{failed: []}}, 1_000
    end

    test "returns {:error, %MissingReferenceError{}} when any reference file is missing", %{scenario: scenario} do
      assert {:ok, pid} = Scenario.run(%{scenario | breakpoints: [xl: 800]}, self())
      assert_receive {:error, %Scenario{}}
    end
  end
end
