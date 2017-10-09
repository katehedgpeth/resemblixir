defmodule Resemblixir.Paths do
  @otp_app Application.get_env(:resemblixir, :otp_app) 

  def otp_app, do: @otp_app

  def parent_directory(), do: File.cwd!()

  def file_directory(parent \\ nil)
  def file_directory(nil), do: parent_directory() |> file_directory()
  def file_directory("/" <> _ = parent) do
    Path.join([parent, "priv", "resemblixir"])
  end

  def reference_image_dir(parent_dir \\ nil)
  def reference_image_dir(nil) do
    file_directory()
    |> reference_image_dir()
  end
  def reference_image_dir("/" <> _ = parent_dir) do
    Path.join([parent_dir, "reference_images"])
  end

  def reference_file(parent_dir \\ nil, file_name)
  def reference_file(nil, file_name) when is_binary(file_name), do: reference_file(reference_image_dir(), file_name) 
  def reference_file("/" <> _ = app_dir, file_name) when is_binary(file_name) and is_binary(app_dir) do
    case file_name |> String.split(".") |> Enum.reverse() do
      ["png" | _] -> Path.join([app_dir, file_name])
      [ext, _] -> {:error, {:bad_file_type, ext}}
      _ -> Path.join([app_dir, [file_name, ".png"]])
    end
  end

  def tests_dir(parent_dir \\ nil)
  def tests_dir(nil), do: file_directory() |> tests_dir()
  def tests_dir("/" <> _ = parent_dir), do: Path.join([parent_dir, "test_images"])

  def test_dir(tests_dir \\ nil, test_name)
  def test_dir(nil, test_name) when is_binary(test_name), do: test_dir(tests_dir(), test_name)
  def test_dir("/" <> _ = tests_dir, "test_" <> _ = test_name), do: Path.join([tests_dir, test_name])

  def test_file("/" <> _ = app_dir, file_name) when is_binary(file_name) and is_binary(app_dir) do
    case file_name |> String.split(".") |> Enum.reverse() do
      ["png" | _] -> Path.join([app_dir, file_name])
      [ext, _] -> {:error, {:bad_file_type, ext}}
      _ -> Path.join([app_dir, [file_name, ".png"]])
    end
  end

  def file_name(scenario_name, breakpoint) when is_binary(scenario_name) and is_atom(breakpoint) do
    [scenario_name |> String.replace(" ", "_") |> String.downcase(),
     "_",
    Atom.to_string(breakpoint)]
     |> IO.iodata_to_binary()
  end

  def new_test_name do
    date = DateTime.utc_now()
           |> DateTime.to_iso8601(:basic)
           |> String.replace(".", "")
           |> String.replace("T", "")
           |> String.replace("Z", "")

    "test_" <> date
  end
end
