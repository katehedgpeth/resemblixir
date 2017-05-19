defmodule Resemblixir.Helpers do
  def file_path(path) do
    File.cwd!()
    |> Path.join(path)
  end
end
