defmodule Resemblixir.MixTaskTest do
  use ExUnit.Case
  alias Resemblixir.{Scenario, TestHelpers, Compare, References}

  setup do
    {:ok, bypass: Bypass.open()}
  end

  describe "run/1" do
    test "returns :ok on success", %{bypass: bypass} do
      Bypass.expect(bypass, fn conn -> 
        img_path = Path.join([Application.app_dir(:resemblixir), "priv", "img_1.png"])
        Plug.Conn.resp(conn, 200, File.read!(img_path))
      end)

      url = TestHelpers.bypass_url(bypass)

      scenarios = [%Scenario{breakpoints: [xs: 320], url: url, name: "scenario_" <> Integer.to_string(System.unique_integer([:positive]))}]
      {:ok, _} = References.generate(scenarios)

      Application.put_env(:resemblixir, :scenarios, scenarios)
      assert %Resemblixir{failed: [], passed: [%Scenario{failed: [], passed: [xs: %Compare{}]}]} = Mix.Tasks.Resemblixir.run(scenarios)
    end

    test "raises Resemblixir.ScenarioConfigError when there are no tests to run" do
      assert_raise(Resemblixir.ScenarioConfigError, fn -> Mix.Tasks.Resemblixir.run([]) end)
    end
  end
end
