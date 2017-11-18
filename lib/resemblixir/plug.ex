defmodule Resemblixir.Plug do
  use Plug.Builder

  def init(_opts) do
    %{}
  end

  def call(%Plug.Conn{path_info: ["resemblixir", "test"]} = conn, _opts) do
    IO.inspect conn
    conn
    |> Phoenix.Controller.put_view(ResemblixirWeb.PageView)
    |> Phoenix.Controller.render("test.html", config: Application.get_all_env(:resemblixir))
  end
  def call(conn, opts), do: conn
end
