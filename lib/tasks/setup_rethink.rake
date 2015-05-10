require 'rethinkdb'

include RethinkDB::Shortcuts

namespace :setup_rethink do

  desc "creates players table"
  task :create_players_table => :environment do

    address = Rails.env.production? ? Rails.application.secrets.db_address : "localhost:28015"
    host, port = address.split(":")

    r.connect(
      host: host,
      port: port,
      db: 'snake',
      auth_key: Rails.application.secrets.db_password
    ).repl

    begin
      r.table_create("players").run
    rescue RethinkDB::RqlRuntimeError => e
      puts e.message
      puts e.backtrace
      puts "Players table already exists"
    end

    begin
      r.table("players").index_create("high_score").run
    rescue
      puts "highscore already indexed"
    end

  end

end