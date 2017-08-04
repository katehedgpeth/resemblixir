module Resemble.FileData exposing (FileData, init)

type alias FileData =
  { width : Int
  , height : Int
  , data : List Int
  }

init : FileData
init =
  { width = 0
  , height = 0
  , data = []
  }
