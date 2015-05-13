require 'pusher'
require 'rethinkdb'
require 'tilt/erubis'
require 'eventmachine'

Pusher.url = ENV["PUSHER_RETHINK_URL"]

include RethinkDB::Shortcuts

r.connect(
  host: "localhost",
  port: 28015,
  db: 'snake',
).repl

PLAYERS = r.table("players")

LIVE_SCORES = PLAYERS.has_fields("score")
LEADERBOARD = PLAYERS.order_by({index: r.desc('high_score')}).limit(5)

EventMachine.next_tick do

  LIVE_SCORES.changes.em_run do |err, change|
    updated_player = change["new_val"]
    Pusher["scores"].trigger("new_score", updated_player)
  end

  LEADERBOARD.changes.em_run do |err, change|
    updated_player = change["new_val"]
    Pusher["scores"].trigger("new_high_score", updated_player)
  end

end