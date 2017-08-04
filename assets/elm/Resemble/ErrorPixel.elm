module Resemble.ErrorPixel exposing (colors, flat, movement, flatDifferenceIntensity, movementDifferenceIntensity)

-- MODULES
import Resemble.PixelColor exposing (PixelColor)

colors : PixelColor
colors =
  { red = 255
  , green = 0
  , blue = 255
  , alpha = 255
  }


flat : List Int -> List Int
flat pixels =
  pixels ++ [colors.red, colors.green, colors.blue, colors.alpha]

movement : List Int -> PixelColor -> PixelColor -> List Int
movement pixels d1 d2 =
  let
    errorColors = colors
    red = doMovement d2 (.red)
    green = doMovement d2 (.green)
    blue = doMovement d2 (.blue)
    alpha = d2.alpha
  in
    pixels ++ List.map (abs) [red, green, blue, alpha]

doMovement : PixelColor -> (PixelColor -> Int) -> Int
doMovement pixel getter =
  let
    pixelColor = getter pixel
    errorColor = getter colors
    base = pixelColor * (errorColor // 255)
  in
    (base + errorColor) // 2


flatDifferenceIntensity : List Int -> List Int
flatDifferenceIntensity pixels =
  pixels

movementDifferenceIntensity : List Int -> List Int
movementDifferenceIntensity pixels =
  pixels
