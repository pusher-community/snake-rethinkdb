$(document).ready(function(){

  var leaders = [];

  function showLeaderBoard(){

    var sortedLeaders = _.sortBy(leaders, function(leader){
      return leader.high_score
    }).reverse();

    if (sortedLeaders.length > 5) sortedLeaders = sortedLeaders.slice(0,5);

    var board = sortedLeaders.map(function(leader){
      return "<li class='high-score' data-id='" + leader.id + "' ><p><b>" + leader.name + "</b> " + leader.high_score + "</p></li>"
    });
    $('ul#high-scores-list').html(board);
  }

  $.get("/players", function(data){
    leaders = data;
    showLeaderBoard();
  });


  function startGame(){
    $(this).hide();
    $("#canvas").show();
    $(document).trigger("start_game");
  }

  $("#start-playing").on("click", startGame);

  $("#enter-name").on("keydown", function(event){
    if (event.keyCode != 13) return;
    var name = $(this).val()
    $.post("/players", {name: name}).success(startGame.bind(this));
    
  });

  $(document).on("game_over", function(event, score){
    $.post("/players/score", {score: score})
  });

  var pusher = new Pusher('1f0686af24f0faebe5d4');
    
  var scoresChannel = pusher.subscribe('scores');

  scoresChannel.bind("new_score", function(player){
    var shownObject = {name: player.name, score: player.score}
    $('ul#json-feed').prepend("<li>" + JSON.stringify(shownObject) +  "</li>")
  });

  scoresChannel.bind('new_high_score', function(player) {
    var playerNeedsUpdate = _.findWhere(leaders, {id: player.id})
    if (playerNeedsUpdate) leaders = _.without(leaders, playerNeedsUpdate);
    leaders.push(player);
    showLeaderBoard();
  });

});