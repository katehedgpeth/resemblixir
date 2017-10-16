defmodule Resemblixir.Screenshot do
  alias Resemblixir.{Scenario, Paths}

  defstruct [:url, :path, :breakpoint, :width]
  @type t :: %__MODULE__{
    url: String.t,
    path: String.t
  }

  @spec take(Scenario.t, breakpoint::atom) :: __MODULE__.t
  def take(%Scenario{url: url, folder: folder, name: name} = scenario, {breakpoint, width})
  when is_binary(url) and is_atom(breakpoint) and is_binary(folder) and is_binary(name) do
    {:ok, session} = Wallaby.start_session()
    session
    |> Wallaby.Browser.resize_window(width, width * 1.5)
    |> Wallaby.Browser.visit(url)
    |> Wallaby.Browser.take_screenshot()
    |> do_take(scenario, breakpoint, width)
  end

  defp do_take(%Wallaby.Session{screenshots: [screenshot]} = session, %Scenario{name: name, url: url, folder: folder}, breakpoint, width) do
    :ok = Wallaby.end_session(session)

    name
    |> Paths.file_name(breakpoint)
    |> move_screenshot(folder, screenshot)
    |> format_result(url, breakpoint, width)
  end

  defp move_screenshot(file_name, folder, screenshot) do
    image_path = Paths.test_file(folder, file_name)
    {File.rename(screenshot, image_path), image_path}
  end

  defp format_result({:ok, path}, url, breakpoint, width) do
    %__MODULE__{url: url, path: path, breakpoint: breakpoint, width: width}
  end
end
