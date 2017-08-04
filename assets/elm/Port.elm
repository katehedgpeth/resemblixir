port module Port exposing (..)

-- PACKAGES
import Html exposing (Html, div)

-- MODULES
import Resemble.Image exposing (Image)

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

type alias Model =
  { images : List Image
  }

type Msg
  = Run (List Image)
  | Result (List Image)
  | Error String

init : (Model, Cmd Msg)
init =
  Model [] ! []

port runner : List Image -> Cmd msg

port listener : (List Image -> msg) -> Sub msg

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Run images ->
      model ! []

    Result result ->
      model ! []

    Error error ->
      model ! []

subscriptions : Model -> Sub Msg
subscriptions model =
  listen Result

view : Model -> Html Msg
view model =
  div [] []
