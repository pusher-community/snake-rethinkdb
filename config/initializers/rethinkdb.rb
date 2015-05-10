require 'rethinkdb'
require 'eventmachine'

include RethinkDB::Shortcuts

address = Rails.env.production? ? Rails.application.secrets.db_address : "localhost:28015"

host, port = address.split(":")

r.connect(
  host: host,
  port: port,
  db: 'snake',
  auth_key: Rails.application.secrets.db_password
).repl

Thread.new do 
  EventMachine.run do

    r.table("players").has_fields("score").changes.em_run do |err, change|
      updated_player = change["new_val"]
      Pusher["scores"].trigger("new_score", updated_player)
    end

    r.table('players').order_by({index: r.desc('high_score')}).limit(5).changes.em_run do |err, change|
      updated_player = change["new_val"]
      Pusher["scores"].trigger("new_high_score", updated_player)
    end

  end
end