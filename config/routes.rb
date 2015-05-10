Rails.application.routes.draw do

  root to: "home#index"

  resources :players

  post 'players/score', to: "players#new_score"


end
