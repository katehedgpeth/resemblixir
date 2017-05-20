defmodule Resemblixir.Web.PageController do
  use Resemblixir.Web, :controller

  def index(conn, _params) do
    {host, port} = get_socket_info()
    conn
    |> assign(:host, host)
    |> assign(:port, port)
    |> render("index.html")
  end

  defp get_socket_info() do
    :resemblixir
    |> Application.get_env(Resemblixir.Web.Endpoint, %{})
    |> Enum.into(%{})
    |> do_get_socket_info()
  end

  defp do_get_socket_info(%{url: [host: host, port: port]}) do
    {host, port}
  end
  defp do_get_socket_info(%{url: [host: host], http: [port: port]}) do
    {host, port}
  end
end
