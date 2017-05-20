module Main exposing (main)

-- PACKAGES
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Phoenix.Socket
import Phoenix.Channel exposing (..)
import Phoenix.Push
import Debug exposing (log)
import Json.Encode as JsEncode
import Json.Decode as JsDecode exposing (..)
import Json.Decode.Pipeline as Pipeline exposing (..)
import RemoteData exposing (..)

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
  , phxSocket : Phoenix.Socket.Socket Msg
  , status : Status
  }

type alias Flags =
  { websocketUrl : String
  }

type Status
  = Ready
  | Running
  | Finished
  | Error

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

    model = { tests = Loading
            , phxSocket = socket
            , status = Ready
            }
  in
    (model, Cmd.map PhoenixMsg phxCmd)

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
        ( { model | phxSocket = phxSocket }, Cmd.map PhoenixMsg phxCmd )

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


view model =
  case (model.tests, model.status) of
    (Loading, _) ->
      div [] [ ]
    (Success [], _) ->
      p [class "alert alert-danger"] [
        span [] [text "No reference images to test! Click here to generate a new set of reference images."],
        a [href ""] []
      ]
    (Success tests, _) ->
      p [] [
        text "Starting tests!"
      ]

    (Failure error, _) ->
      div [class "alert alert-danger"] [
        text "An error has occurred."
      ]
    (NotAsked, _) ->
      div [class "alert alert-info"] [
        text "Generating reference images..."
      ]
-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Phoenix.Socket.listen model.phxSocket PhoenixMsg
