defmodule ResemblixirTest do
  alias Resemblixir.{TestHelpers, Scenario, Compare, MissingReferenceError, Breakpoint, TestFailure, Opts, ScenarioConfigError, UrlError}
  use Resemblixir.ScenarioCase, async: false

  describe "get_scenarios/0" do
    @tag generate_scenarios: false
    test "returns scenarios when Application.get_env(:scenarios) is a json path" do
      json_path = Path.join([Application.app_dir(:resemblixir), "priv", "scenarios.json"])
      scenarios = [%{name: "scenario_1", url: nil, breakpoints: %{xs: 320, sm: 544}}]
      assert {:ok, json} = Poison.encode(scenarios)
      assert :ok = File.write(json_path, json)
      prev_config = Application.get_env(:resemblixir, :scenarios)
      assert :ok = Application.put_env(:resemblixir, :scenarios, json_path)
      assert Resemblixir.get_scenarios() == scenarios
      assert :ok = Application.put_env(:resemblixir, :scenarios, prev_config)
      assert :ok = File.rm(json_path)
    end

    @tag generate_scenarios: false
    test "throws ScenarioConfigError for any other error" do
      prev_config = Application.get_env(:resemblixir, :scenarios)
      assert :ok = Application.put_env(:resemblixir, :scenarios, nil)
      {:ok, _pid} = Resemblixir.run()
      assert_receive {:error, %ScenarioConfigError{scenarios: nil}}, 5_000
      assert :ok = Application.put_env(:resemblixir, :scenarios, prev_config)
    end
  end

  describe "make_test_folder/0" do
    @tag generate_scenarios: false
    test "creates a new test folder" do
      test_folder = Resemblixir.make_test_folder()
      assert is_binary(test_folder)
      assert File.exists?(test_folder)
      assert :ok = File.rmdir(test_folder)
    end
  end

  describe "run/1" do
    @tag scenario_count: 2
    test "sends {:ok, %Resemblixir{}} on success", %{scenarios: [%Scenario{}, %Scenario{}] = scenarios} do
      assert [%{breakpoints: %{xs: 454}}, _] = scenarios
      scenarios
      |> Enum.map(&Map.from_struct/1)
      |> Resemblixir.run()
      assert_receive {:ok, %Resemblixir{passed: passed, failed: []}}, 5000
      assert [%Scenario{failed: [], passed: passed_1},
              %Scenario{failed: [], passed: passed_2}] = passed
      assert [%Breakpoint{name: :xs, result: {:ok, %Compare{}}}] = passed_1
      assert [%Breakpoint{name: :xs, result: {:ok, %Compare{}}}] = passed_2

    end

    @tag scenario_count: 2
    test "returns :error on failure", %{scenarios: [%Scenario{name: name_1} = scenario_1, %Scenario{name: name_2} = scenario_2]} do
      TestHelpers.remove_scenario_references(scenario_1)
      [scenario_1, scenario_2]
      |> Enum.map(&Map.from_struct/1)
      |> Resemblixir.run(%Opts{raise_on_error?: false})
      assert_receive {:error, %TestFailure{failed: [failed], passed: [passed]}}, 5_000
      assert failed.name == name_1
      assert failed.passed == []
      assert [%Breakpoint{result: failed_result}] = failed.failed
      assert {:error, %MissingReferenceError{}} = failed_result
      assert passed.name == name_2
      assert passed.failed == []
      assert [%Breakpoint{result: {:ok, %Compare{}}}] = passed.passed
    end

    @tag setup_bypass: false
    test "works when site is unreachable", %{scenarios: scenarios} do
      scenarios
      |> Enum.map(&Map.from_struct/1)
      |> Resemblixir.run()
      assert_receive {:error, %TestFailure{failed: [failed], passed: []}}, 5_000
      assert %UrlError{error: error} = failed
      assert %HTTPoison.Error{} = error
    end

    @tag setup_bypass: false
    test "works when url returns bad status code", %{scenarios: scenarios} do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 404, "") end)
      scenarios
      |> Enum.map(fn scenario ->
        scenario
        |> Map.from_struct()
        |> Map.put(:url, "http://localhost:#{bypass.port}")
      end)
      |> Resemblixir.run()
      assert_receive {:error, %TestFailure{failed: [failed], passed: []}}, 5_000
      assert %UrlError{error: error} = failed
      assert %HTTPoison.Response{status_code: 404} = error
    end
  end
end
