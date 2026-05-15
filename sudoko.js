const board = document.getElementById("board");
const message = document.getElementById("message");

const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");
const mistakesText = document.getElementById("mistakes");
const hintsText = document.getElementById("hints");

let selectedCell = null;

let solution = [];
let puzzle = [];

let currentLevel = "easy";

let timer;
let seconds = 0;

let score = 0;
let mistakes = 0;
let hintsLeft = 3;

const removeCount = {
  easy:45,
  moderate:52,
  difficult:58,
  expert:62,
  master:68
};

// Create empty board
function createEmptyBoard(){

  return Array.from({length:9},() =>
    Array(9).fill(0)
  );
}

// Shuffle array
function shuffle(array){

  for(let i=array.length-1;i>0;i--){

    const j=Math.floor(Math.random()*(i+1));

    [array[i],array[j]]=[array[j],array[i]];
  }

  return array;
}

// Check valid move
function isValid(board,row,col,num){

  for(let x=0;x<9;x++){

    if(board[row][x]===num) return false;

    if(board[x][col]===num) return false;
  }

  const startRow=row-row%3;
  const startCol=col-col%3;

  for(let i=0;i<3;i++){

    for(let j=0;j<3;j++){

      if(board[startRow+i][startCol+j]===num){
        return false;
      }
    }
  }

  return true;
}

// Fill board
function fillBoard(board){

  for(let row=0;row<9;row++){

    for(let col=0;col<9;col++){

      if(board[row][col]===0){

        let numbers=shuffle([1,2,3,4,5,6,7,8,9]);

        for(let num of numbers){

          if(isValid(board,row,col,num)){

            board[row][col]=num;

            if(fillBoard(board)){
              return true;
            }

            board[row][col]=0;
          }
        }

        return false;
      }
    }
  }

  return true;
}

// Generate solution
function generateSolution(){

  let newBoard=createEmptyBoard();

  fillBoard(newBoard);

  return newBoard;
}

// Generate puzzle
function generatePuzzle(level){

  solution=generateSolution();

  let newPuzzle=solution.map(row => [...row]);

  let remove=removeCount[level];

  while(remove>0){

    let row=Math.floor(Math.random()*9);

    let col=Math.floor(Math.random()*9);

    if(newPuzzle[row][col]!== ""){

      newPuzzle[row][col]="";

      remove--;
    }
  }

  return newPuzzle;
}

// Create board
function createBoard(){

  board.innerHTML="";

  for(let row=0;row<9;row++){

    for(let col=0;col<9;col++){

      const cell=document.createElement("div");

      cell.classList.add("cell");

      if(puzzle[row][col]!== ""){

        cell.textContent=puzzle[row][col];

        cell.classList.add("fixed");
      }

      if(col===2 || col===5){
        cell.style.borderRight="3px solid #1e3a8a";
      }

      if(row===2 || row===5){
        cell.style.borderBottom="3px solid #1e3a8a";
      }

      cell.addEventListener("click",()=>{

        if(cell.classList.contains("fixed")) return;

        document.querySelectorAll(".cell")
          .forEach(c => c.classList.remove("selected"));

        cell.classList.add("selected");

        selectedCell={
          element:cell,
          row,
          col
        };
      });

      board.appendChild(cell);
    }
  }
}

// Fill number
function fillNumber(num){

  if(selectedCell){

    selectedCell.element.textContent=num;

    const correct=solution[selectedCell.row][selectedCell.col];

    if(num===correct){

      selectedCell.element.classList.remove("wrong");

      score+=10;

      scoreText.textContent=`🏆 Score: ${score}`;

      checkWin();
    }
    else{

      selectedCell.element.classList.add("wrong");

      mistakes++;

      mistakesText.textContent=`❌ Mistakes: ${mistakes}/3`;

      if(mistakes>=3){

        clearInterval(timer);

        message.textContent=
          "❌ Game Over! Start New Game";

        disableBoard();

        document.getElementById("newGameBtn")
          .style.display="inline-block";
      }
    }
  }
}

// Disable board
function disableBoard(){

  document.querySelectorAll(".cell")
    .forEach(cell => {
      cell.style.pointerEvents="none";
    });
}

// Enable board
function enableBoard(){

  document.querySelectorAll(".cell")
    .forEach(cell => {
      cell.style.pointerEvents="auto";
    });
}

// Erase number
function eraseNumber(){

  if(selectedCell){

    selectedCell.element.textContent="";
  }
}

// RANDOM HINT SYSTEM
function useHint(){

  if(hintsLeft<=0){

    message.textContent="❌ No Hints Left";

    return;
  }

  let emptyCells=[];

  const cells=document.querySelectorAll(".cell");

  cells.forEach((cell,index)=>{

    if(cell.textContent===""){

      const row=Math.floor(index/9);

      const col=index%9;

      emptyCells.push({
        cell,
        row,
        col
      });
    }
  });

  if(emptyCells.length===0){
    return;
  }

  const randomCell=
    emptyCells[Math.floor(Math.random()*emptyCells.length)];

  const answer=
    solution[randomCell.row][randomCell.col];

  randomCell.cell.textContent=answer;

  randomCell.cell.classList.add("hint-cell");

  hintsLeft--;

  hintsText.textContent=`💡 Hints: ${hintsLeft}`;

  score+=5;

  scoreText.textContent=`🏆 Score: ${score}`;

  checkWin();
}

// Check win
function checkWin(){

  const cells=document.querySelectorAll(".cell");

  let won=true;

  cells.forEach((cell,index)=>{

    const row=Math.floor(index/9);

    const col=index%9;

    if(Number(cell.textContent)!==solution[row][col]){
      won=false;
    }
  });

  if(won){

    clearInterval(timer);

    message.textContent="🎉 You Won The Game!";
  }
}

// Timer
function startTimer(){

  clearInterval(timer);

  seconds=0;

  timer=setInterval(()=>{

    seconds++;

    let mins=Math.floor(seconds/60);

    let secs=seconds%60;

    timerText.textContent=
      `⏱ Time: ${mins}:${secs<10?'0':''}${secs}`;

  },1000);
}

// New game
function newGame(){

  puzzle=generatePuzzle(currentLevel);

  createBoard();

  enableBoard();

  message.textContent="";

  mistakes=0;
  score=0;
  hintsLeft=3;

  mistakesText.textContent="❌ Mistakes: 0/3";

  scoreText.textContent="🏆 Score: 0";

  hintsText.textContent="💡 Hints: 3";

  document.getElementById("newGameBtn")
    .style.display="none";

  startTimer();
}

// Change level
function changeLevel(level){

  currentLevel=level;

  newGame();
}

// Start game
newGame();