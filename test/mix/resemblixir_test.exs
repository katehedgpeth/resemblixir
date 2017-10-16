defmodule Resemblixir.MixTaskTest do
  use Resemblixir.ScenarioCase

  describe "run/1" do
    test "returns :ok on success", %{scenarios: scenarios} do
      scenarios = scenarios
                  |> Enum.map(&Map.from_struct/1)
                  |> Enum.map(& Map.delete(&1, :folder))
      assert :ok  = Mix.Tasks.Resemblixir.run(["--no-log"], scenarios)
    end

    @tag generate_references: false
    test "raises %Resemblixir.TestFailure{} on failure", %{scenarios: scenarios} do
      scenarios = scenarios
                  |> Enum.map(&Map.from_struct/1)
                  |> Enum.map(& Map.delete(&1, :folder))
      assert_raise(Resemblixir.TestFailure, fn -> Mix.Tasks.Resemblixir.run([], scenarios) end)
    end

    @tag generate_scenarios: false
    test "raises Resemblixir.NoScenariosError when there are no tests to run" do
      assert_raise(Resemblixir.NoScenariosError, fn -> Mix.Tasks.Resemblixir.run([], []) end)
    end
  end
end
