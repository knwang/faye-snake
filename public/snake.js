function checkSupported() {
  canvas = document.getElementById('canvas');
  if (canvas.getContext){
    start(canvas);
  } else {
    alert("We're sorry, but your browser does not support the canvas tag. Please use any web browser other than Internet Explorer.");
  }
}


function start(canvas){

  this.client = new Faye.Client("/faye");  

  var subscription = client.subscribe('/foo', function (data) {  
    alert(data);  
  });  
  

  ctx = canvas.getContext('2d');
  gridSize = 10;
  ctx.clearRect(0,0, canvas.width, canvas.height);
  this.world = new World (canvas, gridSize);
  
  world.addSnake(new Snake(50,50,3,'right','rgb(200,0,0)'));
  world.addSnake(new Snake(100,100,3,'left','rgb(0,200,0)'));
  

  world.newFood();
  play(world);
}

function play(world){
  interval = setInterval(function refreshWorld() {
    //alert("snake1:" + JSON.stringify(world.snakes[0].currentPosition) + "snake2:" + JSON.stringify(world.snakes[1].currentPosition));
    world.snakes[0].move();
    world.snakes[1].move();
    world.refresh();
    }
    ,100
  );
  

};


function World (canvas, gridSize) {
  var self = this;
  this.snakes = new Array;
  this.canvas = canvas;
  this.gridSize = gridSize;
  this.foodPoint = null; 
  this.allowPressKeys = true;
  

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
  };

  World.prototype.newFood = function() {
    this.foodPoint = new Food(Math.floor(Math.random()*(this.canvas.width/this.gridSize))*this.gridSize, Math.floor(Math.random()*(this.canvas.height/this.gridSize))*this.gridSize);
    for(j=0; j< this.snakes.length; j++){
      if (this.snakes[j].body.indexOf(this.foodPoint) >= 0) {
        this.newFood();
      }
    }
    
    ctx = this.canvas.getContext('2d');
    ctx.fillStyle = "rgb(10,100,0)";
    ctx.fillRect(this.foodPoint.x, this.foodPoint.y, this.gridSize, this.gridSize);
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

    if (this.body.some(function(element){
                          //alert('currentPosition=' + JSON.stringify(self.currentPosition));
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


