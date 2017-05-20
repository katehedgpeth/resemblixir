defmodule Resemblixir.Web.PageControllerTest do
  use Resemblixir.Web.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Resemblixir"
  end
end
