var mySnake, canvas, ctx, world;
var gridSize = 10; 
var client = new Faye.Client("/faye");
var allowPressKeys = true;

var subscription = this.client.subscribe('/snake-channel', function (data) {  
  if (data == 'getTheOtherSnake') client.publish('/snake-channel', {food: JSON.stringify(world.foodPoint), snake: JSON.stringify(mySnake)});
  else {
    newSnake = JSON.parse(data.snake);
    snake = new Snake(newSnake.fillStyle);
    snake.update(newSnake);

    foodPoint = JSON.parse(data.food);
    world.clearFood();
    world.foodPoint = foodPoint;
    world.drawFood();
    if (mySnake == undefined || (snake.id != mySnake.id)){
      world.addSnake(snake);
    }
  }
});  

$(document).ready(function() {
   canvas = $("#canvas")[0]; 
   if (ctx = canvas.getContext('2d')){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    world = new World();
    world.drawFood();

    bindRunSnakeButton();
    bindNewGameButton();
    defineArrowKeys();

    client.publish('/snake-channel', 'getTheOtherSnake');    
    play();
    
  } else {
    alert("We're sorry, but your browser does not support the canvas tag. Please use any web browser other than Internet Explorer.");
    return false;    
  }
  
});


function bindRunSnakeButton(){
  $("#run_snake").click(function(){
    color = world.snakes.length == 0 ? 'rgb(200,0,0)' : 'rgb(0,200,0)' ; 
    mySnake = world.addSnake(new Snake(color));
    $("#run_snake").hide();
    $("#new_game").show();
    client.publish('/snake-channel', {food: JSON.stringify(world.foodPoint), snake: JSON.stringify(mySnake)});    
  });
 
}

function bindNewGameButton(){
  $("#new_game").hide();
  $("#new_game").click(function(){
    world = new World();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $("#run_snake").show();
    $("#new_game").hide();
    
  });
}

function play(){
  interval = setInterval(function refreshWorld() {
    world.moveSnakes();
    }
    ,100
  );
};


function World () {
  var self = this;
  this.snakes = new Array;
  this.foodPoint = new Position();
  

  World.prototype.refresh = function() {
    for(i=0; i<this.snakes.length; i++){
      this.snakes[i].draw(canvas);    
      if (this.snakes[i].currentPosition.x == this.foodPoint.x && this.snakes[i].currentPosition.y == this.foodPoint.y) {
        this.newFood();
        this.snakes[i].length += 1;
        this.snakes[i].updateScore();
      }
    }
  };

  World.prototype.addSnake = function(snake) {
    this.snakes.push(snake);
    return snake;
  };

  World.prototype.newFood = function() {
    this.foodPoint = new Position();
    for(j=0; j< this.snakes.length; j++){
      if (this.snakes[j].body.indexOf(this.foodPoint) >= 0) {
        this.newFood();
      }
    }
    this.drawFood();
  };
  

  World.prototype.drawFood = function(){
    ctx.fillStyle = "rgb(10,100,0)";
    ctx.fillRect(this.foodPoint.x, this.foodPoint.y, gridSize, gridSize);    
  }

  World.prototype.clearFood = function(){
    ctx.clearRect(this.foodPoint.x, this.foodPoint.y, gridSize, gridSize);    
  }

  World.prototype.moveSnakes = function(){
    for(n=0;n<this.snakes.length;n++){
      this.snakes[n].move();
    }
    this.refresh();
  }

}

function Position() {
  this.x = Math.floor(Math.random()*(canvas.width/gridSize))*gridSize;
  this.y = Math.floor(Math.random()*(canvas.height/gridSize))*gridSize;
}

function Snake(color) {
  var self = this;
 
  this.id = Date.now(); // use timestamp as snake's id
  this.body = new Array();
  this.length = 3; 
  this.currentPosition = new Position(canvas, gridSize);
  this.direction = randomDirection();
  this.fillStyle = color;
  this.score = 0; 
  
  Snake.prototype.update = function(aSnake) {
    this.id = aSnake.id; 
    this.body = aSnake.body;
    this.length = aSnake.length; 
    this.currentPosition = aSnake.currentPosition;
    this.direction = aSnake.direction;
    this.fillStyle = aSnake.fillStyle;
    this.score = aSnake.score; 
  }

  function randomDirection(){
    switch(Math.floor(Math.random()*4)) {
      case 0: return 'up';
      case 1: return 'left';
      case 2: return 'right';
      case 3: return 'down';
    }
  
  };


  Snake.prototype.moveUp = function (){
    if ( this.currentPosition.y - gridSize >= 0) {
      this.executeMove('up', 'y', this.currentPosition.y - gridSize);
    } else {
      this.whichWayToGo('x');
    }

  }; 

  Snake.prototype.moveDown = function (){
    if (this.currentPosition.y + gridSize < canvas.height) {
      this.executeMove('down', 'y', this.currentPosition.y + gridSize);          
    } else {
      this.whichWayToGo('x');
    } 

  };
  
  Snake.prototype.moveLeft = function() {
    if (this.currentPosition.x - gridSize >= 0) {
      this.executeMove('left', 'x', this.currentPosition.x - gridSize);
    } else {
      this.whichWayToGo('y');
    }
    
  };
  
  Snake.prototype.moveRight = function(){
    if (this.currentPosition.x + gridSize < canvas.width) {
      this.executeMove('right', 'x', this.currentPosition.x + gridSize);
    } else {
      this.whichWayToGo('y');
    } 
  }; 

  Snake.prototype.executeMove = function(dirValue, axisType, axisValue) {
    this.direction = dirValue;
    this.currentPosition[axisType] = axisValue;
  }

  Snake.prototype.draw = function(canvas) {
    for(k=0; k < this.body.length; k++){
      if ((this.body[k].x == this.currentPosition.x) && (this.body[k].y == this.currentPosition.y)){
        gameOver();
      };
    };

    context = canvas.getContext('2d');
    this.body.push({'x': this.currentPosition.x, 'y': this.currentPosition.y});
    context.fillStyle = this.fillStyle;
    context.fillRect(this.currentPosition.x, this.currentPosition.y, gridSize, gridSize);

    if (this.body.length > this.length) {
      var itemToRemove = this.body.shift();
      context.clearRect(itemToRemove.x, itemToRemove.y, gridSize, gridSize);
    }  
  };
  
  Snake.prototype.move = function(){
    switch(this.direction){
      case 'up':
        this.moveUp();
        break;

      case 'down':
        this.moveDown();
        break;
      
      case 'left':
        this.moveLeft();
        break;

      case 'right':
        this.moveRight();
        break;
    }
  };

  Snake.prototype.whichWayToGo = function(axisType){  
    if (axisType=='x') {
      a = (this.currentPosition.x> canvas.width / 2) ? this.moveLeft() : this.moveRight();
    } else {
      a = (this.currentPosition.y > canvas.height / 2) ? this.moveUp() : this.moveDown();
    }
  };

  Snake.prototype.updateScore = function(){
    var score = (this.length - 3)*10
    document.getElementById('score').innerText = score;
  }

}

function restart(){
  pause();
  start();
}

function pause(){
  clearInterval(interval);
  allowPressKeys = false;
}


function gameOver(){
  var score = (mySnake.length - 3)*10;
  pause();
  alert("Game Over. Your score was "+ score);
  ctx.clearRect(0,0, canvas.width, canvas.height);
  document.getElementById('play_menu').style.display='none';
  document.getElementById('restart_menu').style.display='block';
}


function defineArrowKeys(){
  $(window).keydown(function(event) {
    
    //  if (!allowPressKeys){
    //    return null;
    //  }
    //
    var keyCode; 
    if(event == null)
    {
      keyCode = window.event.keyCode; 
    }
    else 
    {
      keyCode = event.keyCode; 
    }
  
    var snake = mySnake;
    switch(keyCode)
    {

      case 37:
        if (snake.direction != "right"){
        snake.direction = 'left';
        world.moveSnakes();
      }
      break;
     
    case 38:
      if (snake.direction != "down"){
        snake.direction = 'up';
        world.moveSnakes();
      }
      break; 
      
    case 39:
      if (snake.direction != "left"){
        snake.direction = 'right';
        world.moveSnakes();
      }
      break; 
    
    case 40:
      if (snake.direction != "up"){
        snake.direction = 'down';
        world.moveSnakes();
      }
      break; 
    
    default: 
      break; 
    }
  }); 
}


