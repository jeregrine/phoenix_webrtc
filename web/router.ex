defmodule PhoenixWebrtc.Router do
  use PhoenixWebrtc.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :put_user_token
  end

  defp put_user_token(conn, _) do
    user_id = UUID.uuid1()
    token = Phoenix.Token.sign(conn, "user socket", user_id)
    conn
    |> assign(:user_id, user_id)
    |> assign(:user_token, token)
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", PhoenixWebrtc do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", PhoenixWebrtc do
  #   pipe_through :api
  # end
end
