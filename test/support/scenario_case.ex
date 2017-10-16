defmodule Resemblixir.ScenarioCase do
  alias Resemblixir.{TestHelpers, Paths}
  import TestHelpers
  use ExUnit.CaseTemplate

  setup tags do
    {:ok, ref: ref_folder, tests: tests_folder} = ensure_folders()
    id = generate_id()

    bypass = Bypass.open()

    assert {:ok, name: test_name, folder: test_folder} = test_paths()
    assert test_folder == Path.join([File.cwd!(), "priv", "resemblixir", "test_images", test_name])

    scenarios = if tags[:generate_scenarios] == false do
      []
    else
      scenario_count = tags[:scenario_count] || 1
      assert is_integer(scenario_count)
      for n <- 1..scenario_count, do: generate_scenario(id, n, test_folder, bypass, tags)
    end

    unless tags[:remove_images] == false do
      on_exit fn ->
        assert {:ok, _} = File.rm_rf(test_folder)
        for scenario <- scenarios, do: remove_scenario_references(scenario)
      end
    end

    {:ok, tests_folder: tests_folder,
          reference_folder: ref_folder,
          test_folder: test_folder,
          test_name: test_name,
          id: id,
          scenarios: scenarios,
          bypass: bypass}
  end
end
