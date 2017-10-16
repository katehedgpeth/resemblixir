defmodule Resemblixir.ScenarioTest do
  alias Resemblixir.{Paths, Scenario, MissingReferenceError, References, Compare}
  use Resemblixir.ScenarioCase, async: true

  describe "run/1" do
    test "returns {:ok, %Scenario{}} when all breakpoints pass", %{scenarios: [scenario]} do
      assert {:ok, %Scenario{failed: failed, passed: passed}} = Scenario.run(scenario)
      assert failed == []
      assert [xs: %Compare{}] = passed
    end

    test "returns {:error, %MissingReferenceError{}} when any reference file is missing", %{scenarios: [scenario]} do
      file_name = Paths.file_name(scenario.name, :xl)
      refute Paths.reference_image_dir() |> Paths.reference_file(file_name) |> File.exists?()
      assert {:error, %Scenario{failed: failed}} = Scenario.run(%{scenario | breakpoints: %{xl: 800}})
      assert [{:xl, %MissingReferenceError{breakpoint: :xl}}] = failed
    end

    test "returns {:error, %Scenario{}} when any breakpoint fails", %{scenarios: [scenario]} do
      {_, _} = References.generate_breakpoint({:xs, 800}, scenario)
      assert {:error, %Scenario{failed: failed}} = Scenario.run(scenario)
      assert [{:xs, %Compare{images: %{diff: diff}, dimension_difference: %{width: width}}}] = failed
      assert File.exists?(diff)
      assert width == 338
    end
  end
end
