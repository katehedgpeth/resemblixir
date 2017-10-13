defmodule ResemblixirTest do
  alias Resemblixir.TestHelpers
  use ExUnit.Case, async: true

  describe "get_scenarios/0" do
    test "returns scenarios when :scenarios is a list of %{name: _, url: _, breakpoints: [_]}" do
      json_path = Path.join([Application.app_dir(:resemblixir), "priv", "scenarios.json"])
      scenarios = [%{name: "scenario_1", url: nil, breakpoints: %{xs: 320, sm: 544}}]
      assert {:ok, json} = Poison.encode(scenarios)
      assert :ok = File.write(json_path, json)
      prev_config = Application.get_env(:resemblixir, :scenarios)
      assert :ok = Application.put_env(:resemblixir, :scenarios, json_path)
      assert Resemblixir.get_scenarios() == scenarios
      assert :ok = Application.put_env(:resemblixir, :scenarios, prev_config)
    end

    test "throws ScenarioConfigError for any other error" do
      prev_config = Application.get_env(:resemblixir, :scenarios)
      assert :ok = Application.put_env(:resemblixir, :scenarios, nil)
      assert_raise Resemblixir.ScenarioConfigError, fn -> Resemblixir.get_scenarios() end
      assert :ok = Application.put_env(:resemblixir, :scenarios, prev_config)
    end
  end

  describe "run/1" do
    test "returns :ok on success" do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn ->
        img_path = Path.join([Application.app_dir(:resemblixir), "priv", "img_1.png"])
        Plug.Conn.resp(conn, 200, File.read!(img_path))
      end)

      url = TestHelpers.bypass_url(bypass)

      scenarios = [%{breakpoints: [xs: 320], url: url, name: "scenario_" <> Integer.to_string(System.unique_integer([:positive]))}]

      assert {:ok, _} = Resemblixir.References.generate(scenarios)

      assert {:ok, %Resemblixir{failed: []}} = Resemblixir.run(scenarios)
    end
  end

  describe "make_test_folder/0" do
    test "creates a new test folder" do
      test_folder = Resemblixir.make_test_folder()
      assert is_binary(test_folder)
      assert File.exists?(test_folder)
      assert :ok = File.rmdir(test_folder)
    end

  end
end
