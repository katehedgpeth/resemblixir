defmodule Resemblixir.MixTaskTest do
  use ExUnit.Case
  alias Resemblixir.{TestHelpers, References}

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

      scenarios = [%{breakpoints: %{xs: 320}, url: url, name: "scenario_" <> Integer.to_string(System.unique_integer([:positive]))}]
      {:ok, _} = References.generate(scenarios)

      assert :ok  = Mix.Tasks.Resemblixir.run([], scenarios)
    end

    test "raises Resemblixir.NoScenariosError when there are no tests to run" do
      assert_raise(Resemblixir.NoScenariosError, fn -> Mix.Tasks.Resemblixir.run([], []) end)
    end
  end
end
