defmodule ResemblixirWeb.ChannelTest do
  use ResemblixirWeb.ChannelCase

  alias ResemblixirWeb.Channel

  test "broadcasts breakpoint_started when breakpoint is started" do
    socket = subscribe_and_join(socket(), Channel, "resemblixir:test")
    for {breakpoint, {width, height}} <- Application.get_env(:resemblixir, :breakpoints) do
      assert_broadcast("breakpoint_started", %{
        template: :index,
        view: :page,
        breakpoint: ^breakpoint,
        file_name: file_name,
        height: ^height,
        width: ^width
      })
      assert file_name == "page_index_" <> Atom.to_string(breakpoint)
    end
  end

  test "broadcasts test_image_ready when screenshot is taken" do
    socket = subscribe_and_join(socket(), Channel, "resemblixir:test")
    for {breakpoint, {width, height}} <- Application.get_env(:resemblixir, :breakpoints) do
      assert_broadcast("test_image_ready", %{
        template: :index,
        view: :page,
        breakpoint: ^breakpoint,
        file_name: file_name,
        height: ^height,
        width: ^width
      }, 5_000)
      assert file_name == "page_index_" <> Atom.to_string(breakpoint)
    end
  end
end
