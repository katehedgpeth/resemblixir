defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(args \\ [], scenarios \\ nil) do
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    do_run(args, scenarios)
  end
  def do_run(args, nil), do: do_run(args, Resemblixir.get_scenarios())
  def do_run(_args, scenarios) when is_list(scenarios) do
    case Resemblixir.run(scenarios) do
      {:ok, _scenarios} -> :ok
      {:error, error} -> raise error
    end
  end

end
