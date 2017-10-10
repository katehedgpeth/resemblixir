defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(_args \\ []) do
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    case Resemblixir.run() do
      {:ok, scenarios} -> :ok
      {:error, error} -> raise error
    end
  end

end
