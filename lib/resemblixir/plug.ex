defmodule Resemblixir.Plug do
  use Plug.Builder

  plug Plug.Static,
    at: "/", from: :resemblixir, gzip: false,
    only: ~w(css fonts images js favicon.ico robots.txt)

  def init(_opts) do
    %{}
  end

  def call(%Plug.Conn{path_info: ["resemblixir", "test"]} = conn, _opts) do
    IO.inspect conn
    conn
    |> Phoenix.Controller.put_layout({LayoutView, "app.html"})
    |> Phoenix.Controller.put_view(ResemblixirWeb.PageView)
    |> Phoenix.Controller.render("test.html", config: Application.get_all_env(:resemblixir))
    |> Plug.Conn.halt()
  end
  def call(conn, opts), do: conn
end
