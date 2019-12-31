//---------------variables and constants

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

var pattern = new Image();
pattern.src = "images/pattern_diamond.svg";
pattern.height = 40;
pattern.width = 40;
var ballImage = new Image();
ballImage.src = "images/dot.svg";
ballImage.height = 33;
ballImage.width = 33;

const difficulty_delay = 1000;

var radius = 220;

const interval_range = 30;

const difficulty_pause = 10;

const starting_time = 10*60;

var intervals = [];

var index = 0;

let timeStamp = 0;

class ScoreTable {
    constructor() {
        this.correct = new Array(3).fill(0);
        this.wrong = 0;
        this.count = -1;
        this.game_started = false;
    }

    resetScores()
    {
        for(var i = 0; i< this.correct.length;i++)
        {
            this.correct[i]=0;
        }
        
        this.wrong = 0;
        this.count = false;
    }

}
//--------------functions

var show_message; 
$( document ).ready(function() {
    show_message = function(scr)
    {   /* adding the correct img src - working, just need to vactorize last 2 images*/
        switch(scr)
        {
            case 0: $('#message').attr("src", 'images/excellent_message.svg'); break;
            case 1: $('#message').attr("src", 'images/v_good_message.svg'); break;
            case 2: $('#message').attr("src", 'images/good_message.svg'); break;
            case 5: $('#message').attr("src", 'images/missed_message.svg'); break;
            default: $('#message').attr("src", 'images/wrong.svg'); break;
        }
        $('#message_area').delay(100).css('display','block').animate({
            opacity: 0,
            bottom: "+=50",
          }, 1000, function() {
            setTimeout(reset_position(),100);
          });
    }
});
function reset_position()
{
    $('#message_area').css('display','none').css('opacity','1').css('bottom','200px');
}

function drawPattern()
// Drawing the background pattern.
{
    for (var i = 0; i < canvas.width / pattern.width; i++)
     {
        for(var j = 0; j < canvas.height / pattern.height ; j++ )
        {
            ctx.drawImage(pattern, i*pattern.height, j*pattern.height,pattern.height, pattern.width);
        }
    }
}

function drawBall(ctx, x_pos, y_pos)
// Drawing the ball on the canvas in a given position.
{  
    ctx.drawImage(ballImage, x_pos,y_pos ,ballImage.height, ballImage.width);
}

function get_circle_positions(canvas, radius)
// Assign into an array the positions of dots on a circle with a given radius. The center of the circle is the center of the canvas.
// The number of dots is set in a constant "interval_range".
{

    var y = canvas.height / 2 - ballImage.height/2;
    var x = canvas.width / 2 - ballImage.width/2;
    var angle = 2 * Math.PI / interval_range;

    var interval = {x:0,y:0};
    var intervals = [];

    for(num = 1; num < interval_range + 1; num++)
    {
        interval.x = x +  radius * Math.cos(num * angle);
        interval.y = y + radius * Math.sin(num * angle);     
        intervals.push({x:interval.x,y:interval.y});
    }
    return intervals;
}

function get_next_pause()
// Randomizes the next pause.
{
    return Math.floor(Math.random() * difficulty_pause) + 10;
}

function update(timeStamp)
{     
    if(pause == timeStamp)
    {
        index++;
        pause = timeStamp + get_next_pause();
        score.count=3;
        var cnt_down = setInterval(function countdown()
        {
            score.count--;
        },1000);
        setTimeout(function() {
            clearInterval(cnt_down);
        }, 3000);
    }
    
    ctx.clearRect(0,0, canvas.width,canvas.height);
    drawPattern();
    if (index >= interval_range - 1)
    {
        index = -1;
    }
    index++;
    
    drawBall(ctx, intervals[index].x,intervals[index].y);
 
}

function update_timer(timeStamp)
{

    var minutes = Math.floor((starting_time - timeStamp) / 60);
    var seconds =  (starting_time - timeStamp) - minutes * 60;

    
    $("#timer").text("Timer: " + minutes.toString().padStart(2, '0') + ':' + 
    seconds.toString().padStart(2, '0'));
}

function stop()
{
    clearInterval(g);
    score.game_started = false;;
    $( "#start" ).prop('disabled',false);
    $( "#pause" ).prop('disabled',true);
    update_modal();
    $('#pause_screen').modal('show');
}
function resume()
{
    score.game_started = true;
    $( "#start" ).prop('disabled',true);
    $( "#pause" ).prop('disabled',false);
    g = setInterval(game,difficulty_delay);
}
function start()
{   
    score = new ScoreTable();
    score.game_started = true;
    $( "#start" ).prop('disabled',true);
    $( "#pause" ).prop('disabled',false);
    index = Math.floor(Math.random() * intervals.length);
    pause = get_next_pause();
    timeStamp = 0;
    g = setInterval(game,difficulty_delay);
}
function game()
{
    if(timeStamp == starting_time)
    {
        stop();
        return;
    }

    update(timeStamp);
    timeStamp++;
    update_timer(timeStamp);
}

$(window).keypress(function track_score(e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
      // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
      e.preventDefault();
      if (score.game_started == true)
      {
          if(score.count>0)
          {
              show_message(3-score.count);
              //alert("correct! " + String(3-score.count) + "Seconds")
              score.correct[score.count-1]++;
              score.count = -1;
          }
          else
          {
              show_message(3);
              score.wrong++;
              //alert("wrong");
          }
      }
    }
  })

  $('body').on('touchstart', function track_score(e) {
      if (score.game_started == true)
      {
          if(score.count>=0)
          {
              score.correct[score.count]++;
              score.count = -1;
          }
          else
          {
              score.wrong++;
              alert("wrong");
          }
      }
  });

  function update_modal()
  {
      $('#exc').text(score.correct[2]);
      $('#v_good').text(score.correct[1]);
      $('#good').text(score.correct[0]);
      $('#wrong').text(score.wrong);
  }
//------------------logic


pattern.onload = drawPattern;

intervals = get_circle_positions(canvas, radius);

var pause;


var score = new ScoreTable();





