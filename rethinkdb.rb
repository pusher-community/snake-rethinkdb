require 'pusher'
require 'rethinkdb'
require 'tilt/erubis'
require 'eventmachine'

Pusher.url = ENV["PUSHER_RETHINK_URL"]

# host, port = (ENV["RACK_ENV"] == "production") ? 

address = (ENV["RACK_ENV"] == "production") ? ENV["DB_ADDRESS"] : "localhost:28015"

host, port = address.split(":")

include RethinkDB::Shortcuts

$conn = r.connect(
  host: host,
  port: port,
  db: 'snake',
  auth_key: ENV["DB_PASSWORD"]
)

PLAYERS = r.table("players")

LIVE_SCORES = PLAYERS.has_fields("score")
LEADERBOARD = PLAYERS.order_by({index: r.desc('high_score')}).limit(5)

EventMachine.next_tick do

  LIVE_SCORES.changes.em_run($conn) do |err, change|
    updated_player = change["new_val"]
    Pusher["scores"].trigger("new_score", updated_player)
  end

  LEADERBOARD.changes.em_run($conn) do |err, change|
    updated_player = change["new_val"]
    Pusher["scores"].trigger("new_high_score", updated_player)
  end

end