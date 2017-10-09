defmodule Mix.Tasks.Resemblixir do
  use Mix.Task

  def run(_args \\ []) do
    case Resemblixir.run() do
      {:ok, scenarios} -> :ok
      {:error, error} -> raise error
    end
  end

end
