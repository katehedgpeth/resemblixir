defmodule Mix.Tasks.Resemblixir do
  alias Resemblixir.{Opts, TestFailure, NoScenariosError}
  use Mix.Task

  def run(args \\ [], scenarios \\ nil) do
    {:ok, _} = Application.ensure_all_started(:resemblixir)
    {opts, _, _} = OptionParser.parse(args, switches: [log: :boolean])
    do_run(opts, scenarios)
  end

  @spec do_run(Opts.t, [map] | nil) :: :ok
  defp do_run(_args, scenarios) when is_list(scenarios) or is_nil(scenarios) do
    {:ok, _pid} = Resemblixir.run(scenarios, %Opts{raise_on_error: false})
    await_result()
  end

  defp await_result do
    receive do
      {:ok, %Resemblixir{} = result} ->
        log_success(result)
      {:error, %TestFailure{} = error} ->
        log_error({TestFailure, error})
      {:error, %NoScenariosError{} = error} ->
        log_error({NoScenariosError, error})
    end
  end

  @spec log_success(Resemblixir.success) :: Resemblixir.success_result
  defp log_success(%Resemblixir{passed: passed, failed: []} = result) do
    [
      "All scenarios passed!\n",
      Enum.map(passed, &[&1.name])
    ]
    |> IO.iodata_to_binary()
    |> Mix.shell.info()
    {:ok, result}
  end

  @spec log_error({atom, Resemblixir.error}) :: Resemblixir.error_result
  defp log_error({module, error}) do
    module
    |> apply(:message, [error])
    |> Mix.shell.error()
    {:error, error}
  end
end
