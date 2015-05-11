class PlayersController < ApplicationController

  def index
    leaders = r.table("players").order_by({index: r.desc('high_score')}).limit(5).run
    render json: leaders.to_json
  end

  def create
    if !session[:id]
      response = r.table("players").insert(name: params[:name]).run
      id = response["generated_keys"][0]
      session[:id] = id
    end
    render json: {id: session[:id]}
  end

  def new_score
    id = session[:id]
    score = params[:score].to_i

    player = r.table("players").get(id).run

    score_update = {score: score}

    if !player["score"] || score > player["high_score"]
      score_update[:high_score] = score
    end

    r.table("players").get(id).update(score_update).run
    render json: {succcess:200}
  end

end
