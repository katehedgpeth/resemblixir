# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :resemblixir, ResemblixirWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "u1KkBjQu4zZU1GX8z05a3vcLIveiFHS1s89Fn4hOnQupLyD+xFA7hDlDrrvXVkPF",
  render_errors: [view: ResemblixirWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Resemblixir.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :resemblixir, :scenarios, [
  page: [{:index, %{run_backstop: false}}]
]

config :resemblixir, :breakpoints, [
  xs_narrow: {320, 479},
  xs_wide: {543, 713},
  sm_narrow: {544, 714},
  sm_wide: {799, 1023},
  md_lg: {800, 1024},
  xxl: {1236, 1600}
]

config :resemblixir, :router, ResemblixirWeb.Router
config :resemblixir, :endpoint, ResemblixirWeb.Endpoint

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
