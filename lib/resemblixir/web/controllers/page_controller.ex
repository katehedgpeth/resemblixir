defmodule Resemblixir.Web.PageController do
  use Resemblixir.Web, :controller

  def index(conn, _params) do
    {host, port} = get_socket_info()
    conn
    |> assign(:host, host)
    |> assign(:port, port)
    |> assign_images()
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

  def assign_images(%Plug.Conn{query_params: %{"img1" => path_1, "img2" => path_2}} = conn) do

    Enum.reduce [{:img_1, path_1}, {:img_2, path_2}], conn, &assign_image(&1, &2)
  end
  def assign_images(conn), do: conn

  defp assign_image({name, path}, conn) do
    new_path =
    :ok = File.cp(path, Path.join(["assets", "static", "images", path]))
    {width, height} = dimensions(path)
    assign(conn, name, Poison.encode!(%{path: static_path(conn, Path.join("/images", path)),
                                        width: width,
                                        height: height}))
  end

  defp dimensions(path) do
    path
    |> File.read()
    |> do_dimensions()
  end
  def do_dimensions({:ok, <<0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, _length :: size(32), "IHDR",
                            width :: size(32), height :: size(32), _::binary>>}), do: {width, height}
end
