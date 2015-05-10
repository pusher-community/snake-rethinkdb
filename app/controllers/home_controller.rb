class HomeController < ApplicationController

  def index
    @high_score_players = r.table("players").has_fields("high_score").order_by(r.desc("high_score")).limit(10).run
    @current_player = session[:id] && r.table("players").get(session[:id]).run
  end

end
