function checkSupported() {
  canvas = document.getElementById('canvas');
  if (canvas.getContext){
    start(canvas);
  } else {
    alert("We're sorry, but your browser does not support the canvas tag. Please use any web browser other than Internet Explorer.");
  }
}


function start(canvas){
  ctx = canvas.getContext('2d');
  gridSize = 10;
  ctx.clearRect(0,0, canvas.width, canvas.height);
  var snake1 = new Snake(50,50,3,'right','rgb(200,0,0)');
  this.world = new World (canvas, gridSize);
  
  world.addSnake(snake1);
  world.newFood();

  //updateScore();

  //  direction = 'right';
  play();


}

function play(){
  interval = setInterval(function refreshWorld() {
    world.snakes[0].move();     
    world.refresh();
    }
    ,100
  );
  

};


function World (canvas, gridSize) {
  this.snakes = new Array;
  this.canvas = canvas;
  this.gridSize = gridSize;
  this.foodPoint = null; 
  this.allowPressKeys = true;
  

  World.prototype.refresh = function() {
   
    this.snakes[0].draw(canvas);    

    if (this.snakes[0].currentPosition.x == this.foodPoint.x && this.snakes[0].currentPosition.y == this.foodPoint.y) {
      this.newFood();
      this.snakes[0].length += 1;
      this.snakes[0].updateScore();
    }
  };

  World.prototype.addSnake = function(snake) {
    this.snakes.push(snake);
  };

  World.prototype.newFood = function() {
    this.foodPoint = new Food(Math.floor(Math.random()*(this.canvas.width/this.gridSize))*this.gridSize, Math.floor(Math.random()*(this.canvas.height/this.gridSize))*this.gridSize);
    if (this.snakes[0].body.indexOf(this.foodPoint) >= 0) {
      this.newFood();
    } else {
      ctx = this.canvas.getContext('2d');
      ctx.fillStyle = "rgb(10,100,0)";
      ctx.fillRect(this.foodPoint.x, this.foodPoint.y, this.gridSize, this.gridSize);
    };
  };
  

}

function Food (positionX, positionY) {
  this.x = positionX;
  this.y = positionY; 
}

function Snake (startPositionX, startPositionY, length, direction, fillStyle) {
  var self = this;
  this.body = new Array();
  this.length = length; 
  this.currentPosition = {'x': startPositionX, 'y': startPositionY};
  this.direction = direction;
  this.fillStyle = fillStyle;
  this.score = 0; 
  
  Snake.prototype.moveUp = function (){
    if ( self.currentPosition.y - gridSize >= 0) {
      self.executeMove('up', 'y', self.currentPosition.y - gridSize);
    } else {
      self.whichWayToGo('x');
    }

  }; 

  Snake.prototype.moveDown = function (){
    if (self.currentPosition.y + gridSize < canvas.height) {
      self.executeMove('down', 'y', self.currentPosition.y + gridSize);    
    } else {
      self.whichWayToGo('x');
    } 

  };
  
  Snake.prototype.moveLeft = function() {
    if (self.currentPosition.x - gridSize >= 0) {
      self.executeMove('left', 'x', self.currentPosition.x - gridSize);
    } else {
      self.whichWayToGo('y');
    }
    
  };
  
  Snake.prototype.moveRight = function(){
    if (self.currentPosition.x + gridSize < canvas.width) {
      self.executeMove('right', 'x', self.currentPosition.x + gridSize);
    } else {
      self.whichWayToGo('y');
    } 
  }; 

  Snake.prototype.executeMove = function(dirValue, axisType, axisValue) {
    self.direction = dirValue;
    self.currentPosition[axisType] = axisValue;
  }

  Snake.prototype.draw = function(canvas) {

    if (this.body.some(function(element){
                          return (element.x == self.currentPosition.x) && (element.y == self.currentPosition.y);
                      })){
      gameOver();
      return false;
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
      a = (self.currentPosition.x> canvas.width / 2) ? self.moveLeft() : self.moveRight();
    } else {
      a = (self.currentPosition.y > canvas.height / 2) ? self.moveUp() : self.moveDown();
    }
  };

  Snake.prototype.updateScore = function(){
    var score = (this.length - 3)*10
    document.getElementById('score').innerText = score;
  }


}

function restart(){
  pause();
  start(canvas);
}

function pause(){
  clearInterval(interval);
  allowPressKeys = false;
}


function gameOver(){
  var score = (world.snakes[0].length - 3)*10;
  pause();
  alert("Game Over. Your score was "+ score);
  ctx.clearRect(0,0, canvas.width, canvas.height);
  document.getElementById('play_menu').style.display='none';
  document.getElementById('restart_menu').style.display='block';
}


document.onkeydown = function(event) {
//  if (!allowPressKeys){
//    return null;
//  }
  var keyCode; 
  if(event == null)
  {
    keyCode = window.event.keyCode; 
  }
  else 
  {
    keyCode = event.keyCode; 
  }
 
  var snake = world.snakes[0];
  switch(keyCode)
  {

    case 37:
      if (snake.direction != "right"){
        snake.moveLeft();
        world.refresh();
      }
      break;
     
    case 38:
      if (snake.direction != "down"){
        snake.moveUp();
        world.refresh()
      }
      break; 
      
    case 39:
      if (snake.direction != "left"){
        snake.moveRight();
        world.refresh();
      }
      break; 
    
    case 40:
      if (snake.direction != "up"){
        snake.moveDown();
        world.refresh();
      }
      break; 
    
    default: 
      break; 
  } 
}


