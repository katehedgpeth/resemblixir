defmodule ResemblixirTest do
  alias Resemblixir.TestHelpers
  use ExUnit.Case, async: true

  def build_scenarios, do: [%{name: "scenario_1", url: "http://localhost:4001", breakpoints: [xs: 320]}]
  def error_scenarios, do: nil

  describe "get_scenarios/0" do
    test "returns scenarios when :scenarios is a list of %{name: _, url: _, breakpoints: [_]}" do
      scenarios = build_scenarios()
      assert :ok = Application.put_env(:resemblixir, :scenarios, scenarios)
      assert Resemblixir.get_scenarios() == scenarios
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

      scenarios = [%{breakpoints: [xs: 320], url: url, name: "scenario_" <> Integer.to_string(System.unique_integer([:positive]))}]

      assert {:ok, _} = Resemblixir.References.generate(scenarios)

      assert {:ok, %Resemblixir{failed: []}} = Resemblixir.run(scenarios)
    end
  end
end
