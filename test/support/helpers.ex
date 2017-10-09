defmodule Resemblixir.TestHelpers do
  def html(page \\ 1) when is_integer(page) do
    {:ok, image_path} = image_path(page)
    [
      "<html>",
        "<head></head>",
        "<body>",
          "<h1>Hello this is a webpage</h1>",
          image_path, ":",
          "<p><img src='", image_path, "' /> </p>",
        "</body>",
      "</html>"
    ] |> IO.iodata_to_binary()
  end

  def image_path(page \\ 1) when is_integer(page) do
    path = Path.join([File.cwd!(), "test", "support", ["img_", Integer.to_string(page), ".png"]])
    if File.exists?(path) do
      {:ok, "file://" <> path}
    else
      {:error, path}
    end
  end

  def bypass_url(bypass) do
    URI.to_string(%URI{scheme: "http", host: "localhost", port: bypass.port})
  end
end
