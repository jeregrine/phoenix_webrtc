defmodule PhoenixWebrtc.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "users:lobby", PhoenixWebrtc.UsersChannel
  channel "call:*", PhoenixWebrtc.CallChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket, timeout: 45_000

  def connect(%{"token" => token}, socket) do
    case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
      {:ok, user_id} ->
        {:ok, assign(socket, :user_id, user_id)}
      {:error, _} ->
        :error
    end
  end

  def id(socket), do: "users_socket:#{socket.assigns.user_id}"
end
