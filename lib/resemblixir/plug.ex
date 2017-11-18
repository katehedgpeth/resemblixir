defmodule Resemblixir.Plug do
  use Plug.Builder

  def init(opts) do
    %{}
  end

  def call(%Plug.Conn{path_info: ["resemblixir", "test"]} = conn, opts) do
    path = Resemblixir.Endpoint.url()
           |> Path.join(Resemblixir.Router.page_path(:test))
    Plug.Conn.redirect(conn, path)
  end
  def call(conn, opts), do: conn
end
