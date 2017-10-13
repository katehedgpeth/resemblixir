defmodule Resemblixir.ReferencesTest do
  alias Resemblixir.{TestHelpers, References, Scenario, Paths}
  use ExUnit.Case, async: true

  @breakpoints [xs: 300, sm: 544, md: 800, lg: 1200]
  @screenshot File.cwd!() |> Path.join("/priv/img_1.png") |> File.read!()

  describe "generate_breakpoint/3" do
    test "returns {breakpoint_name, screenshot_path}" do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 200, @screenshot) end)
      url = TestHelpers.bypass_url(bypass)

      assert {:xs, screenshot_path} = References.generate_breakpoint({:xs, 320}, %Scenario{name: "scenario_1", url: url})
      assert screenshot_path == Path.join([File.cwd!(), "priv", "resemblixir", "reference_images", "scenario_1_xs.png"])
      assert :ok = File.rm(screenshot_path)
    end
  end

  describe "generate_scenario/1" do
    test "returns {scenario_name, [{breakpoint_name, screenshot_path}]}" do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 200, @screenshot) end)
      url = TestHelpers.bypass_url(bypass)
      scenario = %Scenario{breakpoints: @breakpoints, name: "scenario_2", url: url}
      assert References.generate_scenario(scenario) == {"scenario_2", [xs: Paths.reference_file("scenario_2_xs.png"),
                                                                       sm: Paths.reference_file("scenario_2_sm.png"),
                                                                       md: Paths.reference_file("scenario_2_md.png"),
                                                                       lg: Paths.reference_file("scenario_2_lg.png")]}
    end
  end

  describe "generate/1" do
    test "generates screenshots for all scenarios at all breakpoints" do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 200, @screenshot) end)
      url = TestHelpers.bypass_url(bypass)
      scenarios = for num <- 1..4, do: %{breakpoints: @breakpoints, name: "scenario_#{num}", url: url}
      expected = for num <- 4..1 do
        {"scenario_#{num}", [xs: Paths.reference_file("scenario_#{num}_xs.png"),
                                 sm: Paths.reference_file("scenario_#{num}_sm.png"),
                                 md: Paths.reference_file("scenario_#{num}_md.png"),
                                 lg: Paths.reference_file("scenario_#{num}_lg.png")]}
      end
      assert References.generate(scenarios) == {:ok, expected}
      for {_, breakpoints} <- expected do
        for {_, path} <- breakpoints do
          assert :ok = File.rm(path)
        end
      end
    end
  end
end
