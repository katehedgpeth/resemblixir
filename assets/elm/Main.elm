module Main exposing (main)

-- PACKAGES
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Element
import Phoenix.Socket
import Phoenix.Channel exposing (..)
import Phoenix.Push
import Debug exposing (log)
import Json.Encode as JsEncode
import Json.Decode as JsDecode exposing (..)
import Json.Decode.Pipeline as Pipeline exposing (..)
import RemoteData exposing (..)

-- MODULES
import Resemble exposing (..)
import Resemble.Image exposing (Image)

-- MAIN
main =
  Html.programWithFlags
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

type alias Model =
  { tests : WebData (List String)
  , images : (Maybe Image, Maybe Image)
  , phxSocket : Phoenix.Socket.Socket Msg
  , status : Status
  , resembleData : Resemble.Model
  }

type alias Flags =
  { websocketUrl : String
  , image_1 : Maybe JsEncode.Value
  , image_2 : Maybe JsEncode.Value
  }

type Status
  = Ready
  | Running
  | Finished
  | Error String
  | Init

type Msg
  = OnJoin JsEncode.Value
  | OnJoinError JsEncode.Value
  | OnClose JsEncode.Value
  | OnData JsEncode.Value
  | HandleSendError JsEncode.Value
  | PhoenixMsg (Phoenix.Socket.Msg Msg)
  | ReferencesMissing JsEncode.Value

init : Flags -> ( Model, Cmd Msg )
init flags =
  let
    initSocket = Phoenix.Socket.init flags.websocketUrl
                 |> Phoenix.Socket.withDebug
                 |> Phoenix.Socket.withoutHeartbeat
                 |> Phoenix.Socket.on "references:missing" "room:lobby" ReferencesMissing

    channel = Phoenix.Channel.init "room:lobby"
              |> Phoenix.Channel.onJoin OnJoin
              |> Phoenix.Channel.onJoinError OnJoinError
              |> Phoenix.Channel.onError OnJoinError
              |> Phoenix.Channel.onClose OnClose

    (socket, phxCmd) = Phoenix.Socket.join channel initSocket

    image_1 = decodeImage flags.image_1

    image_2 = decodeImage flags.image_2

    model = { tests = NotAsked
            , phxSocket = socket
            , status = Init
            , images = (image_1, image_2)
            , resembleData = Resemble.initModel
            }
  in
    (model, Cmd.map PhoenixMsg phxCmd)

decodeImage : Maybe JsEncode.Value -> Maybe Image
decodeImage val =
  case val of
    Nothing -> Nothing
    Just val ->
      val
      |> JsDecode.decodeValue (imageDecoder)
      |> Result.toMaybe

imageDecoder : Decoder Image
imageDecoder =
  Pipeline.decode Image
    |> Pipeline.required "width" int
    |> Pipeline.required "height" int
    |> Pipeline.required "path" string

update msg model =
  case msg of
    OnJoin _ ->
      let
        _ = log "successfully joined channel"
        phxPush =
          Phoenix.Push.init "start" "room:lobby"
          |> Phoenix.Push.onOk OnData
          |> Phoenix.Push.onError HandleSendError

        (phxSocket, phxCmd) = Phoenix.Socket.push phxPush model.phxSocket
      in
        requestImages { model | phxSocket = phxSocket }

    OnData data ->
      (model, Cmd.none)

    OnClose _ ->
      (model, Cmd.none)

    OnJoinError _ ->
      (model, Cmd.none)

    HandleSendError error ->
      (model, Cmd.none)

    ReferencesMissing _ ->
      ({model | tests = Success []}, Cmd.none)

    PhoenixMsg msg ->
      let
        (phxSocket, phxCmd) = Phoenix.Socket.update msg model.phxSocket
      in
        ( { model | phxSocket = phxSocket }, Cmd.map PhoenixMsg phxCmd )

requestImages : Model -> ( Model, Cmd Msg )
requestImages model =
  case model.images of
    (Nothing, Nothing) ->
      { model | status = Error "No images to test!" } ! []
    (Just image, Nothing) ->
      { model | status = Error "Image 2 is missing!" } ! []
    (Nothing, Just image) ->
      { model | status = Error "Image 1 is missing!" } ! []
    (Just image1, Just image2) ->
      { model | status = Ready } ! []
  --   ("", "")

view : Model -> Html Msg
view model =
  case model.status of
    Error error ->
      div [class "alert alert-danger"] [text error]

    Ready ->
      div [] [
        text "Ready to go!",
        canvases model
      ]

    Running ->
      div [] [text "Running tests..."]

    Finished ->
      div [] [text "Tests complete!"]

    Init ->
      div [] []

canvases : Model -> Html Msg
canvases model =
  case model.images of
    (Just image1, Just image2) ->
      [image1, image2]
      |> List.indexedMap (,)
      |> List.map (drawCanvas)
      |> div [class "canvases"]
    _ ->
      div [] []

drawCanvas : (Int, Image) -> Html Msg
drawCanvas (idx, image) =

  Html.canvas [width image.width, height image.height, id ("image" ++ toString idx)] []


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Phoenix.Socket.listen model.phxSocket PhoenixMsg
