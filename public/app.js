$(document).ready(function(){

  window.screen.orientation.lock('portrait-primary')

  var name;
  var scores = {}
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

  $.getJSON("/players", function(data){
    leaders = data;
    showLeaderBoard();
  });


  function startGame(){
    $(this).hide();
    $("#canvas").show();
    $(document).trigger("start_game");
  }

  $("#enter-name").on("keydown", function(event){
    if (event.keyCode != 13) return;
    name = $(this).val()
    scores[name] = 0;

    $.post("/players", {name: name}).success(startGame.bind(this));
    
  });

  $(document).on("game_over", function(event, result){
    $.post("/players/score", {score: result})
  });

  var pusher = new Pusher('1f0686af24f0faebe5d4');
    
  var scoresChannel = pusher.subscribe('scores');

  scoresChannel.bind("new_score", function(player){
    scores[player.name] = player.score

    var shownObject = {name: player.name, score: player.score}
    $('ul#json-feed').prepend("<li>" + JSON.stringify(shownObject) +  "</li>")
  });

  scoresChannel.bind('new_high_score', function(player) {
    var playerNeedsUpdate = _.findWhere(leaders, {id: player.id})
    if (playerNeedsUpdate) leaders = _.without(leaders, playerNeedsUpdate);
    leaders.push(player);
    showLeaderBoard();
  });



  function isSmallScreen(){
    return window.innerWidth < 500;
  }

  window.onresize = function(event){
    if (isSmallScreen()){
      $('#canvas').width(window.innerWidth - 50)
    } else {
      $('#canvas').width(450)     
    }
  }



});