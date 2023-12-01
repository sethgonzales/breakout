
const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const restartBtn = document.getElementById('restart-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;

const brickRowCount = 9;
const brickColumnCount = 5;

//create ball props
const ball = {
  //position the ball in the middle of the canvas
  x: canvas.width / 2,
  y: canvas.height / 2,

  //ball radius
  size: 10,

  //animation
  speed: 4,
  dx: 4, //movement on x axis
  dy: -4 //move up on x axis
};

//create paddle props
const paddle = {
  x: canvas.width / 2 - 40, //take away half of the width of the paddle for the position of the paddle
  y: canvas.height - 20, //position the paddle just off of the bottom of the screen
  w: 80,
  h: 10,
  speed: 8,
  dx: 0//only move on x axis
}

//create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,

  //offset positioning 
  offsetX: 45,
  offsetY: 60,
  visible: true, //when hit by a ball this becomes false
}

//create bricks
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = []; //put each brick at each row index into an array
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX; //row iteration times width plus the padding and x offset
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY; //column iteration times width plus the padding and y offset
    bricks[i][j] = { x, y, ...brickInfo }  //takes bricks array the current iteration and column and set it to an object that copies the bricksInfo object with the x and y values we are looking at
  }
}
console.log(bricks);

//draw ball on canvas using paths. List of points connected by lines.
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2); //explains how to draw the ball based on x and y position and size of the ball
  ctx.fillStyle = '#0095dd';
  ctx.fill(); //fill color
  ctx.closePath(); //close the path and make the ball.
}

//draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#0095dd';
  ctx.fill(); //fill color
  ctx.closePath();
}

//draw score on canvas
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30); //create the filled in text and position for the score
}

//draw bricks on canvas
function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent'; //conditional... if the brick is visible, then give color, else make it transparent
      ctx.fill();
      ctx.closePath();
    })
  })
}

//move paddle on canvas. when it is repainted on the canvas we repaint its values onto the canvas
function movePaddle() {
  //append the change in x to the x value of the paddle
  paddle.x += paddle.dx;

  //wall detection for the paddle to stop moving
  if (paddle.x + paddle.w > canvas.width) { //on the right side if the position plus the width is greater than the width of the canvas
    paddle.x = canvas.width - paddle.w;  //move the paddle so that its position is its width minus the paddle width
  }

  if (paddle.x < 0) { //on the left side if the position of the paddle is less than 0 (the left edge)
    paddle.x = 0;  //move the paddle so that its position is 0 (aka it will stop)
  }
}

//moving the ball
function moveBall() {
  //tells the ball to move based on changes in x and y values
  ball.x += ball.dx;
  ball.y += ball.dy;

  //wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) { //take into account the size! 
    ball.dx *= -1; //same as ball.dx = ball.dx*-1 tells the ball to reverse its motion by multiplying its movement by its negative
  }

  //wall collision (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  //paddle collision
  if (ball.x - ball.size > paddle.x && ball.x + ball.size < paddle.x + paddle.w && ball.y + ball.size > paddle.y) { //conditions for the ball running into any side of the paddle
    ball.dy = -ball.speed;
  }

  //bricks collision
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          //check all sides of the brick, 
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          //if we hit any of the bricks...
          ball.dy *= -1; //reverse the direction of the ball
          brick.visible = false; //change the brick to invisible

          increaseScore(); 
        }
      }
    });
  });

  //hit the bottom wall lose
  if(ball.y + ball.size > canvas.height) {
    showAllBricks();
    showRestart();
    ball.dx = 0;
    ball.dy = 0
    paddle.dx = 0;
  }
}

function draw() {
  //clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

//increase score
function increaseScore() {
  score++

  if (score % (brickRowCount * brickRowCount) === 0) { //if there are no bricks remaining
    showAllBricks();
  }
}

//make all bricks appear
function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => brick.visible = true)
  })
}

function restartGame() {
  // Reset ball position
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  
  // Reset ball speed
  ball.dx = 4;
  ball.dy = -4;

  // Reset paddle position
  paddle.x = canvas.width / 2 - 40;
  paddle.y = canvas.height - 20;

  // Reset brick visibility
  bricks.forEach(column => {
    column.forEach(brick => (brick.visible = true));
  });

  // Reset score
  score = 0;

  // Hide restart button
  restartBtn.style.display = 'none';

  // Resume game
  ball.dx = 4;
  ball.dy = -4;
  paddle.dx = 0;
}

function showRestart() {
  restartBtn.style.display = 'block';
}



function update() {
  //move the ball function
  moveBall();
  //move the paddle function
  movePaddle();

  //draw everything
  draw();

  //request animation
  requestAnimationFrame(update);
}

update();


// Event listener for restart button click
restartBtn.addEventListener('click', restartGame);

// Event listener for Enter key press
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && restartBtn.style.display === 'block') {
    restartBtn.click(); // Simulate a click on the restart button
  }
});

//when key is pressed
function keyDown(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    paddle.dx = -paddle.speed;
  }
}

//when key is released
function keyUp(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
    paddle.dx = 0; //change the speed to zero
  }
}

//keyboard event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);


//rules and close event handlers
rulesBtn.addEventListener('click', () => {
  rules.classList.add('show');
});
closeBtn.addEventListener('click', () => {
  rules.classList.remove('show');
});