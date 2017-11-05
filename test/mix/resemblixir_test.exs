defmodule Resemblixir.MixTaskTest do
  # Get Mix output sent to the current
  # process to avoid polluting tests.
  Mix.shell(Mix.Shell.Process)

  use Resemblixir.ScenarioCase

  describe "run/1" do
    test "returns :ok on success", %{scenarios: scenarios} do
      scenarios = scenarios
                  |> Enum.map(&Map.from_struct/1)
                  |> Enum.map(& Map.delete(&1, :folder))
      Mix.Tasks.Resemblixir.run([], scenarios)
      assert_received {:mix_shell, :info, ["All scenarios passed!" <> _]}
    end

    test "works when scenarios is nil", %{scenarios: scenarios} do
      scenarios = scenarios
                  |> Enum.map(&Map.from_struct/1)
                  |> Enum.map(& Map.delete(&1, :folder))
      old_env = Application.get_env(:resemblixir, :scenarios)
      Application.put_env(:resemblixir, :scenarios, scenarios)
      assert {:ok, %Resemblixir{}} = Mix.Tasks.Resemblixir.run([])
      Application.put_env(:resemblixir, :scenarios, old_env)

    end

    @tag generate_references: false
    test "raises %Resemblixir.TestFailure{} on failure", tags do
      scenarios = Enum.map(tags.scenarios, fn scenario ->
                    scenario
                    |> Map.from_struct()
                    |> Map.delete(:folder)
                    |> Map.put(:status_code, 404)
                  end)

      Bypass.expect tags.bypass, fn conn ->
        Plug.Conn.resp(conn, 404, "<html><body>#{conn.request_path}</body></html>")
      end

      Mix.Tasks.Resemblixir.run([], scenarios)
      assert_receive {:mix_shell, :error, ["\n Some scenarios did not pass" <> _]}, 5_000
    end

    @tag generate_scenarios: false
    @tag remove_images: false
    test "raises Resemblixir.NoScenariosError when there are no tests to run" do
      Mix.Tasks.Resemblixir.run([], [])
      assert_receive {:mix_shell, :error, ["No scenarios" <> _]}
    end
  end
end
