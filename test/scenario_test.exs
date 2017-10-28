defmodule Resemblixir.ScenarioTest do
  alias Resemblixir.{Paths, Scenario, MissingReferenceError, References, Compare, UrlError}
  use Resemblixir.ScenarioCase, async: true

  describe "run/1" do
    @tag generate_scenario: false
    test "raises an error if the url doesn't return the expected status code" do
      assert_raise UrlError, fn ->
        Scenario.run(%Scenario{url: "http://localhost:0000/bad_url", name: "bad url", breakpoints: %{xs: 300}, folder: "/bad_folder"})
      end
    end

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
