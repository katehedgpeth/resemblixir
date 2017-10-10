defmodule Mix.Tasks.Resemblixir.ReferencesTest do
  use ExUnit.Case, async: true
  alias Resemblixir.{TestHelpers, Paths}

  @breakpoints [xs: 300, sm: 544, md: 800, lg: 1200]

  def build_scenarios(id, url) do
    for num <- 1..4 do
      %{breakpoints: @breakpoints, name: "#{id}_scenario_#{num}", url: url}
    end
  end


  setup do
    bypass = Bypass.open()
    Bypass.expect(bypass, fn conn ->
      Plug.Conn.resp(conn, 200, File.cwd!() |> Path.join("/priv/img_1.png") |> File.read!())
    end)
    [id | _] = DateTime.utc_now() |> DateTime.to_iso8601(:basic) |> String.split(".")
    url = TestHelpers.bypass_url(bypass)
    scenarios = build_scenarios(id, url)
    :ok = Application.put_env(:resemblixir, :scenarios, scenarios)
    {:ok, url: url, id: id, scenarios: scenarios}
  end

  describe "run/1" do
    test "generates scenario images", %{scenarios: scenarios} do
      assert {:ok, results} = Mix.Tasks.Resemblixir.References.run(["--no-log"])
      refute Enum.empty?(results)
      results = Enum.into(results, %{})
      for scenario <- scenarios do
        assert results[scenario.name]
      end
      for {scenario_name, breakpoints} <- results do
        refute Enum.empty?(breakpoints)
        for {breakpoint_name, file_path} <- breakpoints do
          assert file_path == scenario_name |> Paths.file_name(breakpoint_name) |> Paths.reference_file()
          assert File.exists?(file_path)
          assert :ok = File.rm(file_path)
        end
      end
    end
  end
end 
