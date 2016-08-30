defmodule PhoenixWebrtc.Presence do
  use Phoenix.Presence, otp_app: :phoenix_webrtc,
                        pubsub_server: PhoenixWebrtc.PubSub
end
