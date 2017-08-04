module Resemble exposing (Model, run, initModel)

import Html exposing (canvas)

-- MODULES
import Resemble.PixelColor exposing (PixelColor)
import Resemble.ErrorPixel as ErrorPixel
import Resemble.FileData as FileData exposing (FileData)
import Resemble.Parser as Parser

type Status
  = NotStarted
  | Running
  | Finished
  | Error

type alias Model =
  { pixelTransparency : Int
  , errorPixelColor : PixelColor
  , targetPix : PixelColor
  , useCrossOrigin : Bool
  , largeImageThreshold : Int
  , x : Int
  , y : Int
  , status : Status
  , fileData : FileData
  }

initTargetPix : PixelColor
initTargetPix =
  { red = 0
  , blue = 0
  , green = 0
  , alpha = 0
  }

initModel : Model
initModel =
  { pixelTransparency = 1
  , errorPixelColor = ErrorPixel.colors
  , targetPix = initTargetPix
  , useCrossOrigin = True
  , largeImageThreshold = 1200
  , x = 0
  , y = 0
  , status = NotStarted
  , fileData = FileData.init
  }

run : Model -> a -> Model
run model fileData =
  model

loop : Model -> Model
loop model =
  case (model.x == model.fileData.width, model.y == model.fileData.height) of
    (_, False) ->
      -- we're in the middle of a column, advance y by 1
      doLoop { model | y = model.y + 1 }

    (False, True) ->
      -- column is finished; start next column at top
      doLoop { model | x = model.x + 1, y = 0 }

    (True, True) ->
      -- we are finished
      { model | status = Finished }

doLoop : Model -> Model
doLoop model =
  model

-- HELPERS
colorsDistance : PixelColor -> PixelColor -> Float
colorsDistance p1 p2 =
  let
    red = abs (p1.red - p2.red)
    green = abs (p1.green - p2.green)
    blue = abs (p1.blue - p2.blue)
  in
    (toFloat (red + green + blue)) / 3.0
