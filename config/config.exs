# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
use Mix.Config

config :resemblixir, Resemblixir.Web.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "aaVOrfv/582KHj2fDluDBbrA0TOWBQkABYxjpfRUIp/dF9l/pGt5OlYNODmWXb5K",
  render_errors: [view: Resemblixir.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Resemblixir.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

# This configuration is loaded before any dependency and is restricted
# to this project. If another project depends on this project, this
# file won't be loaded nor affect the parent project. For this reason,
# if you want to provide default values for your application for
# 3rd-party users, it should be done in your "mix.exs" file.

# You can configure for your application as:
#
#     config :resemblixir, key: :value
#
# And access this configuration in your application as:
#
#     Application.get_env(:resemblixir, :key)
#
# Or configure a 3rd-party app:
#
#     config :logger, level: :info
#

# It is also possible to import configuration files, relative to this
# directory. For example, you can emulate configuration per environment
# by uncommenting the line below and defining dev.exs, test.exs and such.
# Configuration from the imported file will override the ones defined
# here (which is why it is important to import them last).
#
#     import_config "#{Mix.env}.exs"
