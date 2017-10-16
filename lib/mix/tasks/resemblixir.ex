defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(args \\ [], scenarios \\ nil) do
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    do_run(args, scenarios)
  end
  def do_run(args, nil), do: do_run(args, Resemblixir.get_scenarios())
  def do_run(args, scenarios) when is_list(scenarios) do
    {opts, _, _} = OptionParser.parse(args, switches: [log: :boolean])
    case Resemblixir.run(scenarios) do
      {:ok, %Resemblixir{passed: passed}} ->
        unless opts[:log] == false, do: log_success(passed)
        :ok
      {:error, scenarios} -> raise %Resemblixir.TestFailure{passed: scenarios.passed, failed: scenarios.failed}
    end
  end

  defp log_success(scenarios) do
    [
      "All scenarios passed!\n",
      Enum.map(scenarios, &[&1.name, "\n"])
    ]
  end
end
