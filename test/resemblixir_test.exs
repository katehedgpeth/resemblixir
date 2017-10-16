defmodule ResemblixirTest do
  alias Resemblixir.{TestHelpers, Scenario, Compare, MissingReferenceError}
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
      assert_raise Resemblixir.ScenarioConfigError, fn -> Resemblixir.get_scenarios() end
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
    test "returns :ok on success", %{scenarios: [%Scenario{}, %Scenario{}] = scenarios} do
      assert [%{breakpoints: %{xs: 454}}, _] = scenarios
      result = scenarios
               |> Enum.map(&Map.from_struct/1)
               |> Resemblixir.run()
      assert {:ok, %Resemblixir{passed: passed, failed: []}} = result
      assert [%Scenario{failed: [], passed: [{:xs, %Compare{}}]},
              %Scenario{failed: [], passed: [{:xs, %Compare{}}]}] = passed

    end

    @tag scenario_count: 2
    test "returns :error on failure", %{scenarios: [%Scenario{name: name_1} = scenario_1, %Scenario{name: name_2} = scenario_2]} do
      assert [:ok] = TestHelpers.remove_scenario_references(scenario_1)
      assert {:error, %Resemblixir{failed: failed, passed: passed}} =
        [scenario_1, scenario_2]
        |> Enum.map(&Map.from_struct/1)
        |> Resemblixir.run()
      assert [%Scenario{name: ^name_1, failed: [{:xs, %MissingReferenceError{}}], passed: []}] = failed
      assert [%Scenario{name: ^name_2, failed: [], passed: [{:xs, %Compare{}}]}] = passed
    end
  end
end
