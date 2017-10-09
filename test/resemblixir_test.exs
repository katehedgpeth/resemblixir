defmodule ResemblixirTest do
  alias Resemblixir.{Scenario, TestHelpers}
  use ExUnit.Case, async: true

  def build_scenarios, do: [%Scenario{name: "scenario_1"}]
  def error_scenarios, do: nil

  describe "get_scenarios/0" do
    test "returns scenarios when :scenarios is a list of %Scenario{}" do
      scenarios = build_scenarios()
      assert :ok = Application.put_env(:resemblixir, :scenarios, scenarios)
      assert Resemblixir.get_scenarios() == scenarios
    end

    test "returns scenarios when :scenarios is a {mod, fn, args} that returns a list of scenarios" do
      assert :ok = Application.put_env(:resemblixir, :scenarios, {__MODULE__, :build_scenarios, []})
      assert Resemblixir.get_scenarios() == build_scenarios()
    end

    test "throws ScenarioConfigError if mfa doesn't return a list of %Scenario{}" do
      assert :ok = Application.put_env(:resemblixir, :scenarios, {__MODULE__, :error_scenarios, []})
      assert_raise Resemblixir.ScenarioConfigError, fn -> Resemblixir.get_scenarios() end
    end

    test "throws ScenarioConfigError for any other error" do
      assert :ok = Application.put_env(:resemblixir, :scenarios, nil)
      assert_raise Resemblixir.ScenarioConfigError, fn -> Resemblixir.get_scenarios() end
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

      scenarios = [%Scenario{breakpoints: [xs: 320], url: url, name: "scenario_" <> Integer.to_string(System.unique_integer([:positive]))}]

      assert {:ok, _} = Resemblixir.References.generate(scenarios)

      assert {:ok, %Resemblixir{failed: []}} = Resemblixir.run(scenarios) 
    end
  end
end
