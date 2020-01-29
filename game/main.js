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

var difficulties = {
    easy : { speed:1000, length:3*60, pause_delay: 10},
    medium : { speed:750, length:5*60, pause_delay: 30},
    hard : { speed:550, length:10*60, pause_delay: 60}
} 

var difficulty = difficulties.easy;

var radius = 220;

const interval_range = 30;

var intervals = [];

var index = 0;

let timeStamp = 0;

class ScoreTable {
    constructor() {
        this.correct = new Array(3).fill(0);
        this.wrong = 0;
        this.missed_jumps = 0;
        this.count = -1;
        this.missed = false;
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
    {   
        switch(scr)
        {
            case 0: $('#message').attr("src", 'images/excellent_message.svg'); break;
            case 1: $('#message').attr("src", 'images/v_good_message.svg'); break;
            case 2: $('#message').attr("src", 'images/good_message.svg'); break;
            case 5: $('#message').attr("src", 'images/missed_message.svg'); break;
            default: $('#message').attr("src", 'images/wrong.svg'); break;
        }
        $('#message_area').delay(10).css('display','block').animate({
            opacity: 0,
            bottom: "+=50",
          }, 800, function() {
            reset_position();
          });
    } 

});

function set_difficulty_easy()
{
    difficulty = difficulties.easy;
    start();
}
function set_difficulty_medium()
{
    difficulty = difficulties.medium;
    start();
}
function set_difficulty_hard()
{
    difficulty = difficulties.hard;
    start();
}

function get_difficulty()
{
    $('#difficulty_modal').modal('show');
}

function reset_position()
{
    $('#message_area').css('display','none').css('opacity','0.9').css('bottom','200px');
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
    return Math.floor(Math.random() * difficulty.pause_delay) + 10;
}

function update() //Draws the board
{     
    
    if (index >= interval_range - 1)
    {
        index = -1;
    }
    index++;

    ctx.clearRect(0,0, canvas.width,canvas.height);
    drawPattern(); 
    drawBall(ctx, intervals[index].x,intervals[index].y);
}

function update_timer(timeStamp)
{
    var minutes = Math.floor((difficulty.length - timeStamp) / 60);
    var seconds =  (difficulty.length - timeStamp) - minutes * 60;

    $("#timer").text("Timer: " + minutes.toString().padStart(2, '0') + ':' + 
    seconds.toString().padStart(2, '0'));
}

function stop()
{
    clearInterval(g);
    score.game_started = false;
    $( "#pause" ).prop('disabled',true);
    update_modal();
    $('#pause_screen').modal('show');
}
function resume(from_instructions = false)
{
    if(from_instructions==false)
    {
        $( "#start" ).prop('disabled',true);
        $( "#pause" ).prop('disabled',false);
    }
    if(timeStamp > 0)
    {
        score.game_started = true;
        g = setInterval(time, 1000);
        var interval = setInterval(function()
        {
         if(score.game_started == false)
        {
           clearInterval(interval);
        }
        if (score.game_started == true)
        {
            update();
        }
        }, difficulty.speed); 
    }
}

function resume_from_instructions()
{
    resume(true);
}

function instructions()
{
    if(score.game_started == true)
    {
        clearInterval(g);
        score.game_started = false;
    }
}

function start()
{   
    $('#resume').prop('disabled', false);
    score = new ScoreTable();
    score.game_started = true;
    $( "#start" ).prop('disabled',true);
    $( "#pause" ).prop('disabled',false);
    index = Math.floor(Math.random() * intervals.length);
    pause = get_next_pause();
    timeStamp = 0;
    g = setInterval(time,1000);

    var interval = setInterval(function()
    {
    if(score.game_started == false)
    {
        clearInterval(interval);
    }
    if (score.game_started == true)
    {
        update();
    }
    }, difficulty.speed); 
}

function time()
{
    if (score.game_started == true)
    {
        if(timeStamp == difficulty.length)
        {
        stop();
        $('#resume').prop('disabled', true);
        return;
        }
    
        if(score.count == 1) //Missed a jump
        {
            if (score.missed == true)
            {
                show_message(5);
                score.missed_jumps++;
                score.missed = false;
            }
        }

        if(pause == timeStamp) // A jump occured 
        {
        index++;
        pause = timeStamp + get_next_pause();
        score.count = 4;
        score.missed = true;
        }

        if(score.count >= 0)
        {
        score.count--;
        }

        timeStamp++;
        update_timer(timeStamp);   
    }
}

$(window).keypress(function track_score(e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
        if(down) return;
        down = true;
      // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
      e.preventDefault();
      if (score.game_started == true)
      {
          if(score.count > 0)
          {
              score.missed = false;
              let i = 3 - score.count;
              show_message(i);
              score.correct[score.count-1]++;
              score.count = -1;
          }
          else
          {
            setTimeout(function(){ show_message(3);}, 600);
            score.wrong++;
          }
      }
    }
  })

  down = false ;
  document.addEventListener('keyup', function () 
  {
    setTimeout(function(){ down = false;}, 800);
    
  }, false);

  function update_modal()
  {
      $('#exc').text(score.correct[2]);
      $('#v_good').text(score.correct[1]);
      $('#good').text(score.correct[0]);
      $('#wrong').text(score.wrong);
      $('#missed_jumps').text(score.missed_jumps);
  }

$('#instruction_modal').on('hidden.bs.modal',function(event){
    event.stopImmediatePropagation();
});
//------------------logic

pattern.onload = drawPattern;

intervals = get_circle_positions(canvas, radius);

var pause;

var score = new ScoreTable();

//$("#inst").click();-------------------------------------------------------------     Uncomment when done


/*
var content

function getInstructions()
{   
    var textfile;
    if (window.XMLHttpRequest)
    { 
        textfile = new XMLHttpRequest(); 
    }
    textfile.onreadystatechange = function ()
    {   
        if (textfile.readyState == 4 && textfile.status == 200)
        { 
            content = textfile.responseText; 
        }
    }
    textfile.open("GET", "instructions.txt", true);
    alert(content);
}

*/
/* ----------------------------phone mode-----------------------------------
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
  });*/