defmodule Resemblixir.PhantomJsTest do
  alias Resemblixir.{PhantomJs, TestHelpers}
  use ExUnit.Case, async: true

  def get_id, do: [:positive] |> System.unique_integer() |> Integer.to_string()
  def get_path(id), do: Path.join([Application.app_dir(:resemblixir), "priv", [id, ".png"]])

  setup tags do
    case tags[:bypass] do
      false -> :ok
      _ ->
        bypass = Bypass.open()
        html = "<html><body><h1>hello</h1></body></html>"
        Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 200, html) end)
        {:ok, bypass: bypass}
    end
  end

  @tag bypass: false
  test "runs as a GenServer" do
    assert {:ok, pid} = PhantomJs.start_link()
    assert is_pid(pid)
  end

  test "can get a screenshot", %{bypass: bypass} do
    assert {:ok, _pid} = PhantomJs.start_link()
    path = get_id() |> get_path()
    refute File.exists?(path)
    task = Task.async(fn -> PhantomJs.queue(path, TestHelpers.bypass_url(bypass), 500) end)
    assert Task.await(task, 5_000) == {:ok, %{status: "success", path: path}}
    assert File.exists?(path)
    assert :ok = File.rm(path)
  end

  test "can handle multiple async requests without dying", %{bypass: bypass} do
    # bypass = Bypass.open()
    # Bypass.expect(bypass, fn conn -> Plug.Conn.resp(conn, 200, TestHelpers.html(1)) end)
    paths = for _ <- 1..3 do
      path = get_id() |> get_path()
      refute File.exists?(path)
      {path, Task.async(fn -> PhantomJs.queue(path, TestHelpers.bypass_url(bypass), 500) end)}
    end
    for {path, task} <- paths do
      assert Task.await(task, 5_000) == {:ok, %{status: "success", path: path}}
      IO.inspect path
      assert File.exists?(path)
      assert :ok = File.rm(path)
    end
  end

  @tag bypass: false
  test "queue_length" do
    assert is_integer GenServer.call(PhantomJs, :queue_length)
  end
end

