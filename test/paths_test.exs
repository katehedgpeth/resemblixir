defmodule Resemblixir.PathsTest do
  use ExUnit.Case, async: true
  alias Resemblixir.Paths

  test "parent_directory" do
    assert Paths.parent_directory() == File.cwd!()
  end

  describe "file_directory" do
    test "with no arguments" do
      assert Paths.file_directory() == Path.join([File.cwd!(), "priv", "resemblixir"])
    end

    test "with other path" do
      assert System.user_home!() |> Paths.file_directory() == Path.join([System.user_home!(), "priv", "resemblixir"])
    end
  end

  describe "reference_image_dir" do
    test "with no arguments" do
      assert Paths.reference_image_dir() == Path.join([File.cwd!(), "priv", "resemblixir", "reference_images/"])
    end

    test "with other path" do
      assert System.user_home!() |> Paths.reference_image_dir() == Path.join([System.user_home!(), "reference_images"])
    end
  end

  describe "reference_file" do
    test "with other path" do
      assert Paths.reference_file(System.user_home!(), "image.png") == Path.join([System.user_home!(), "image.png"])
    end

    test "appends .png if file name has no extension" do
      assert Paths.reference_file("/", "image") == "/image.png"
    end

    test "returns {:error, {:bad_file_type, ext}} if extension is not png" do
      assert Paths.reference_file("/", "image.jpg") == {:error, {:bad_file_type, "jpg"}}
    end
  end

  describe "test_dir" do
    test "with no arguments" do
      assert Paths.tests_dir() == Path.join([File.cwd!(), "priv", "resemblixir", "test_images/"])
    end

    test "with other path" do
      assert System.user_home!() |> Paths.tests_dir() == Path.join([System.user_home!(), "test_images"])
    end
  end

  describe "test_file" do
    test "appends file name to path" do
      assert Paths.test_file(System.user_home!(), "image.png") == Path.join([System.user_home!(), "image.png"])
    end

    test "appends .png if file name has no extension" do
      assert Paths.test_file("/", "image") == "/image.png"
    end

    test "returns {:error, {:bad_file_type, ext}} if extension is not png" do
      assert Paths.test_file("/", "image.jpg") == {:error, {:bad_file_type, "jpg"}}
    end
  end
end
