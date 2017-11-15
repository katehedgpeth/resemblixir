defmodule ResemblixirWeb.PageController do
  use ResemblixirWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def test(conn, _params) do
    conn
    |> assign(:config, Application.get_all_env(:resemblixir))
    |> render("test.html")
  end
end
