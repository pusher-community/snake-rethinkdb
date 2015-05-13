require 'sinatra'
require 'json'
require './rethinkdb'


enable :sessions
set :session_secret, 'super secret encryption key'

get '/' do 
  @current_player = session[:id] && r.table("players").get(session[:id]).run
  erb :index
end

get '/players' do
  leaders = LEADERBOARD.run
  leaders.to_a.to_json
end

post '/players' do
  if !session[:id]
    response = r.table("players").insert(name: params[:name]).run
    session[:id] = response["generated_keys"][0]
  end
  {success:200}.to_json
end

post '/players/score' do 
  id = session[:id]
  score = params[:score].to_i

  player = r.table("players").get(id).run

  score_update = {score: score}

  if !player["score"] || score > player["high_score"]
    score_update[:high_score] = score
  end

  r.table("players").get(id).update(score_update).run
  {success: 200}.to_json
end