$(document).ready(function(){

  Highcharts.setOptions({
      global: {
          useUTC: false
      }
  });

  var graph, name;

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

  $.get("/players", function(data){
    leaders = data;
    showLeaderBoard();
  });


  function startGame(){
    $(this).hide();
    $("#canvas").show();
    $(document).trigger("start_game");
    showGraph();
  }

  $("#start-playing").on("click", function(){
    name = $("#player-name").text();
    scores[name] = 0;
    startGame();
  });

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
    // console.log(scores);
    var chart = $('#graph').highcharts()
    // console.log(scores[player.name])
    if (!_.findWhere(chart.series, {name: player.name})) {
      console.log('adding series')

      var data = [],
      time = (new Date()).getTime(),
      i

      for (i = -19; i <= 0; i += 1) {
        data.push({
          x: time + i * 1000,
          y: 0
        });
      }

      data.push({x: time + i * 1000, y: player.score})

      chart.addSeries({name: player.name, data: data});
    } 
    if (player.score != 0)  scores[player.name] = player.score

    var shownObject = {name: player.name, score: player.score}
    $('ul#json-feed').prepend("<li>" + JSON.stringify(shownObject) +  "</li>")
  });

  scoresChannel.bind('new_high_score', function(player) {
    var playerNeedsUpdate = _.findWhere(leaders, {id: player.id})
    if (playerNeedsUpdate) leaders = _.without(leaders, playerNeedsUpdate);
    leaders.push(player);
    showLeaderBoard();
  });

  function showGraph(){

    window.graph = graph = $('#graph').highcharts({
      chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          events: {
            load: function () {
              setInterval(function(){
                this.series.forEach(function(series){
                  var name = series.name;

                  var x = (new Date()).getTime(),
                      y = scores[name]
                  series.addPoint([x, y], true, true);

                });
              }.bind(this), 1000);

            }
          }
      },
      title: {
        text: 'Live Scores'
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
      },
      yAxis: {
          title: {
            text: 'Value'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }, {
            value: 0,
            width: 1
          }]
      },
      tooltip: {
        formatter: function () {
            return '<b>' + this.series.name + '</b><br/>' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                Highcharts.numberFormat(this.y, 2);
        }
      },
      legend: {
          enabled: false
      },
      exporting: {
          enabled: false
      },
      series: [{
        name: name,
        data: (function () {

          var data = [],
          time = (new Date()).getTime(),
          i;

          for (i = -19; i <= 0; i += 1) {
            data.push({
              x: time + i * 1000,
              y: 0
            });
          }
          return data; 

        }())
      }]
    });

  }


});