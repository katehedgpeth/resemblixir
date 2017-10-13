defmodule Resemblixir.ScreenshotTest do
  alias Resemblixir.{Screenshot, Scenario, Paths, TestHelpers}
  use ExUnit.Case, async: true

  @screenshot File.cwd!() |> Path.join("/priv/img_1.png") |> File.read!()

  describe "take/2" do
    test "takes a screenshot when given valid params" do
      bypass = Bypass.open()
      Bypass.expect(bypass, fn conn ->
        Plug.Conn.resp(conn, 200, @screenshot)
      end)
      folder_path = Path.join([Application.app_dir(:resemblixir), "priv"])
      scenario = %Scenario{folder: folder_path, name: Paths.new_test_name(), url: TestHelpers.bypass_url(bypass)}
      assert %Screenshot{path: path} = Screenshot.take(scenario, {:xs, 320})
      assert File.exists?(path)
      assert :ok = File.rm(path)
    end
  end
end
