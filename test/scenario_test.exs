defmodule Resemblixir.ScenarioTest do
  alias Resemblixir.{Breakpoint, Paths, Scenario, MissingReferenceError, References, Compare, UrlError, Opts}
  use Resemblixir.ScenarioCase, async: true

  describe "run/2" do
    @tag generate_scenario: false
    test "sends {:error, %UrlError} if the url doesn't return the expected status code" do
      error = Scenario.run(%Scenario{url: "http://localhost:0000/bad_url", name: "bad url", breakpoints: %{xs: 300}, folder: "/bad_folder"}, %Opts{})
      assert {:error, %UrlError{}} = error
    end

    test "sends {:ok, %Scenario{}} when all breakpoints pass", %{scenarios: [scenario]} do
      assert {:ok, _pid} = Scenario.run(scenario, %Opts{})
      assert_receive {:result, %Scenario{} = result}, 5000
      assert result.failed == []
      assert [breakpoint] = result.passed
      assert breakpoint.__struct__ == Breakpoint
    end

    test "sends {:error, %MissingReferenceError{}} when any reference file is missing", %{scenarios: [scenario]} do
      file_name = Paths.file_name(scenario.name, :xl)
      refute Paths.reference_image_dir() |> Paths.reference_file(file_name) |> File.exists?()
      assert {:ok, _pid} = Scenario.run(%{scenario | breakpoints: %{xl: 800}}, %Opts{})
      assert_receive {:result, %Scenario{failed: failed, passed: []}}, 5_000
      assert [%Breakpoint{name: :xl, result: {:error, %MissingReferenceError{breakpoint: :xl}}}] = failed
    end

    test "sends {:error, %Scenario{}} when any breakpoint fails", %{scenarios: [scenario]} do
      {_, _} = References.generate_breakpoint({:xs, 800}, scenario)
      assert {:ok, _pid} = Scenario.run(scenario, %Opts{})
      assert_receive {:result, %Scenario{failed: [failed]}}, 5_000
      assert %Breakpoint{name: :xs, result: result} = failed
      assert {:error, %Compare{images: %{diff: diff}, dimension_difference: %{width: width}}} = result
      assert File.exists?(diff)
      assert width == 338
      assert :ok = File.rm(diff)
    end
  end
end
