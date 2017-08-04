module Resemble.Parser exposing (parse, Model)

import Resemble.FileData as FileData exposing (FileData)
import Resemble.PixelColor as PixelColor exposing (PixelColor)

type alias Model =
  { fileData : FileData
  , pixels : List PixelColor
  , width : Int
  , height : Int
  , totals : Totals
  }

type alias Totals =
  { red : Int
  , green : Int
  , blue : Int
  , alpha : Int
  , brightness : Float
  , white : Int
  , black : Int
  }

initModel : FileData -> Int -> Int -> Model
initModel fileData width height =
  { fileData = fileData
  , pixels = []
  , width = width
  , height = height
  , totals =
    { red = 0
    , green = 0
    , blue = 0
    , alpha = 0
    , brightness = 0.0
    , white = 0
    , black = 0
    }
  }

parse : Model -> Model
parse model =
  let
    pixels = listToPixels model.fileData.data []
  in
    List.foldl (doParse) { model | pixels = pixels } pixels

doParse : PixelColor -> Model -> Model
doParse pixel model =
  let
    totals = updateTotals model.totals pixel
  in
    { model | totals = totals }

updateTotals : Totals -> PixelColor -> Totals
updateTotals totals pixel =
  { totals
    | red = totals.red + (colorValue pixel.red)
    , green = totals.green + (colorValue pixel.green)
    , blue = totals.blue + (colorValue pixel.blue)
    , alpha = totals.alpha + (pixel.alpha |> (-) 255 >> colorValue)
    , brightness = totals.brightness + (getBrightness pixel)
    }

colorValue : Int -> Int
colorValue =
  (//) 255 >> (*) 100


listToPixels : List Int -> List PixelColor -> List PixelColor
listToPixels fileData chunks =
  case fileData of
    [] ->
      List.reverse chunks
    _::_ ->
      let
        pixel = fileData
                 |> List.take 4
                 |> toPixel
        rest = List.drop 4 fileData
      in
        listToPixels rest (pixel :: chunks)

toPixel : List Int -> PixelColor
toPixel colors =
  let
    base = {red = 0, green = 0, blue = 0, alpha = 0}
  in
    colors
    |> List.indexedMap (,)
    |> List.foldl (doToPixel) base

doToPixel : (Int, Int) -> PixelColor -> PixelColor
doToPixel (idx, color) pixel =
  case idx of
    0 -> { pixel | red = color }
    1 -> { pixel | green = color }
    2 -> { pixel | blue = color }
    3 -> { pixel | alpha = color }
    _ -> pixel

getBrightness : PixelColor -> Float
getBrightness pixel =
  (pixel.red |> toFloat >> (*) 0.3)
  + (pixel.green |> toFloat >> (*) 0.59)
  + (pixel.blue |> toFloat >> (*) 0.11)
