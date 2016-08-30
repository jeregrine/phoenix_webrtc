defmodule PhoenixWebrtc.CallChannel do
  use PhoenixWebrtc.Web, :channel
  alias PhoenixWebrtc.Presence
  def join("call:" <> callers, payload, socket) do
    [caller_id, other_id] = String.split(callers, ",")
    if caller_id == socket.assigns.user_id || other_id == socket.assigns.user_id do
      send(self, :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{})

    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("signal", payload, socket) do
    broadcast socket, "signal:#{socket.assigns.user_id}", payload
    {:noreply, socket}
  end
end
