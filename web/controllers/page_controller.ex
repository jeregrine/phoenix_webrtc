defmodule PhoenixWebrtc.PageController do
  use PhoenixWebrtc.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
