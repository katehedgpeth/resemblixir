defmodule Resemblixir.Bypass do
  def open() do
    # Bypass.open/1 calls Bypass.setup_framework_integration/2 which throws an error when used outside
    # of ExUnit or espec. This is just a copy of Bypass.open that omits that call to
    # setup_framework_integration but leaves everything else the same.
    #{:ok, _} = Application.ensure_all_started(:bypass)
    #case Supervisor.start_child(Bypass.Supervisor, [[port: port]]) do
    #  {:ok, pid} ->
    #    port = Bypass.Instance.call(pid, :port)
    #    %Bypass{pid: pid, port: port}
    #  other ->
    #    other
    #end
  end
end
