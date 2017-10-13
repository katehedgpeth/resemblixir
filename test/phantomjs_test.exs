defmodule Resemblixir.PhantomJsTest do
  alias Resemblixir.PhantomJs
  use ExUnit.Case, async: true

  test "runs as a GenServer" do
    assert {:ok, pid} = PhantomJs.start_link()
    assert is_pid(pid)
  end

  test "can get a screenshot" do
    assert {:ok, pid} = PhantomJs.start_link()
    id = System.unique_integer([:positive]) |> Integer.to_string()
    path = Path.join([Application.app_dir(:resemblixir), "priv", [id, ".png"]])
    assert PhantomJs.cmd(path, "http://google.com", 500) == :fail
  end
end

