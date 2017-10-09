defmodule Resemblixir.Compare do
  use GenServer
  alias Resemblixir.Scenario
  alias Wallaby.Session

  defstruct [:test, :scenario, :breakpoint, :mismatch_percentage, :raw_mismatch_percentage, :is_same_dimensions, :analysis_time,
             dimension_difference: %{height: nil, width: nil},
             diff_bounds: %{top: nil, bottom: nil, left: nil, right: nil},
             images: %{ref: nil, test: nil}]

  @type t :: %__MODULE__{
    test: String.t | nil,
    scenario: String.t | nil,
    breakpoint: atom | nil,
    images: %{required(:ref) => String.t | nil, required(:test) => String.t | nil},
    mismatch_percentage: String.t | nil,
    raw_mismatch_percentage: float | nil,
    dimension_difference: %{required(:width) => integer, required(:height) => integer} | nil,
    is_same_dimensions: boolean | nil
  }

  @type result :: {:ok, __MODULE__.t} | {:error, __MODULE__.t}

  @spec compare(test_image_path :: String.t, Scenario.t, breakpoint :: atom, ref_image_path :: String.t) :: result
  def compare(test_image_path, %Scenario{name: test_name}, breakpoint, ref_image_path) when is_binary(test_image_path) do
    # TODO: use :poolboy.transation to run this
    test_image_path
    |> open_port(ref_image_path)
    |> await_result(%__MODULE__{scenario: test_name, breakpoint: breakpoint, images: %{ref: ref_image_path, test: test_image_path}})
  end

  defp await_result(port, %__MODULE__{} = info) do
    receive do
      {^port, {:data, data}} ->
        Port.close(port)
        data
        |> Poison.decode(keys: :atoms!)
        |> format(info)
        |> analyze_result()
    end
  end

  def format({:ok, %{misMatchPercentage: mismatch, rawMisMatchPercentage: raw_mismatch,
                     dimensionDifference: %{ height: _, width: _} = diff,
                     diffBounds: %{ top: _, bottom: _, left: _, right: _} = diff_bounds,
                     isSameDimensions: is_same_dim, analysisTime: time}},
                   %__MODULE__{} = data) do

    %{data | mismatch_percentage: mismatch,
             raw_mismatch_percentage: raw_mismatch,
             dimension_difference: diff,
             is_same_dimensions: is_same_dim,
             diff_bounds: diff_bounds,
             analysis_time: time}
  end
  def format({:error, error}), do: {:error, error}
  def format(error), do: {:error, {:unexpected_error, error}}

  defp format_diff(%{height: height, width: width, top: top, bottom: bottom, diffBounds: bounds}) do
    %{
      height: height,
      width: width,
      top: top,
      bottom: bottom,
      diff_bounds: bounds
    }
  end

  defp analyze_result({:error, error}, _), do: {:error, {:json_error, error}}
  defp analyze_result(%__MODULE__{raw_mismatch_percentage: 0} = result), do: {:ok, result}
  defp analyze_result(%__MODULE__{} = result), do: {:error, result}

  def open_port(test_img, ref_img) do
    cmd = Enum.join(["node", compare_js(), test_img, ref_img], " ")
    Port.open({:spawn, cmd}, [:binary])
  end

  def compare_js do
    :resemblixir
    |> Application.app_dir()
    |> Path.join("/priv/compare.js")
  end
end
