defmodule Resemblixir.Compare do
  use GenServer
  alias Resemblixir.{Scenario, Screenshot}

  defstruct [:test, :scenario, :breakpoint, :mismatch_percentage,
             :raw_mismatch_percentage, :is_same_dimensions, :analysis_time,
             dimension_difference: %{height: nil, width: nil},
             diff_bounds: %{top: nil, bottom: nil, left: nil, right: nil},
             images: %{ref: nil, test: nil, diff: nil}]

  @type t :: %__MODULE__{
    test: String.t | nil,
    scenario: String.t | nil,
    breakpoint: atom | nil,
    images: %{required(:ref) => String.t | nil, required(:test) => String.t | nil, required(:diff) => String.t | nil},
    mismatch_percentage: String.t | nil,
    raw_mismatch_percentage: float | nil,
    dimension_difference: %{required(:width) => integer, required(:height) => integer} | nil,
    is_same_dimensions: boolean | nil
  }

  @type result :: {:ok, __MODULE__.t} | {:error, __MODULE__.t}

  @spec compare(test_image_path :: String.t, Scenario.t, breakpoint :: atom, ref_image_path :: String.t) :: result
  def compare(%Screenshot{path: test_image_path}, %Scenario{name: test_name}, breakpoint, ref_image_path) when is_binary(test_image_path) do
    # TODO: use :poolboy.transation to run this
    ref_image_path
    |> open_port(test_image_path)
    |> await_result(%__MODULE__{scenario: test_name, breakpoint: breakpoint, images: %{ref: ref_image_path, test: test_image_path}})
  end

  defp await_result({result, 0}, %__MODULE__{} = info) do
    result
    |> Poison.decode(keys: :atoms!)
    |> format(info)
    |> analyze_result()
  end

  def format({:ok, %{diff: diff, data: comparison}}, %__MODULE__{} = data), do: do_format(data, diff, comparison)
  def format({:error, error}), do: {:error, error}
  def format(error), do: {:error, {:unexpected_error, error}}

  defp do_format(%__MODULE__{} = data, diff, %{
      misMatchPercentage: mismatch, rawMisMatchPercentage: raw_mismatch,
      dimensionDifference: %{ height: _, width: _} = dimensions,
      diffBounds: %{ top: _, bottom: _, left: _, right: _} = diff_bounds,
      isSameDimensions: is_same_dim, analysisTime: time
    }), do: %{data | mismatch_percentage: mismatch,
                     raw_mismatch_percentage: raw_mismatch,
                     dimension_difference: dimensions,
                     is_same_dimensions: is_same_dim,
                     diff_bounds: diff_bounds,
                     analysis_time: time,
                     images: Map.put(data.images, :diff, diff)}

  defp analyze_result({:error, error}), do: {:error, {:json_error, error}}
  defp analyze_result(%__MODULE__{dimension_difference: %{width: width, height: height}} = result) when width > 0 or height > 0, do: {:error, result}
  defp analyze_result(%__MODULE__{raw_mismatch_percentage: mismatch} = result) when mismatch > 0, do: {:error, result}
  defp analyze_result(%__MODULE__{} = result), do: {:ok, result}

  def open_port(ref_img, test_img) do
    nodejs = System.find_executable("node")
    System.cmd nodejs, [compare_js(), ref_img, test_img], [stderr_to_stdout: true]
  end

  def compare_js do
    :resemblixir
    |> Application.app_dir()
    |> Path.join("/priv/js/compare.bundle.js")
  end
end
