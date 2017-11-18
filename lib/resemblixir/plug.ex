defmodule Resemblixir.Plug do
  use Plug.Builder

  def init(_opts) do
    %{}
  end

  def call(%Plug.Conn{path_info: ["resemblixir", "test"]} = conn, _opts) do
    IO.inspect conn
    path = ResemblixirWeb.Endpoint.url()
           |> Path.join(ResemblixirWeb.Router.Helpers.page_path(ResemblixirWeb.Endpoint, :test))
    Plug.Conn.redirect(conn, path)
  end
  def call(conn, opts), do: conn
end
