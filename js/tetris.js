import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
const nextBlockBox = document.querySelector(".next-block");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 15;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovigItem;
let nextBlock = getRandomBlock();

const movingItem = {
  type: "",
  direction: 0,
  top: 0,
  left: 0,
};

init();

// functions
function init() {
  tempMovigItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNextBlockMatrix();
  generateNewBlock();
}

function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

function generateNextBlockMatrix() {
  for (let i = 0; i < 5; i++) {
    const row = document.createElement("li");
    row.style.display = "flex";
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement("li");
      cell.style.width = "20px";
      cell.style.height = "20px";
      cell.style.border = "1px solid #eee";
      row.appendChild(cell);
    }
    nextBlockBox.appendChild(row);
  }
}

function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovigItem;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });
  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;

    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      tempMovigItem = { ...movingItem };

      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });
  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}

function getRandomBlock() {
  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  return blockArray[randomIndex][0];
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  movingItem.type = nextBlock;
  movingItem.top = 0;
  movingItem.left = 6;
  movingItem.direction = 0;
  tempMovigItem = { ...movingItem };

  nextBlock = getRandomBlock();
  renderBlocks();
  displayNextBlock();
}

function displayNextBlock() {
  // 매트릭스 초기화
  const rows = nextBlockBox.querySelectorAll("li");
  rows.forEach((row) => {
    row.childNodes.forEach((cell) => {
      cell.className = "";
    });
  });

  // 다음 블록 표시
  BLOCKS[nextBlock][0].forEach((block) => {
    const x = block[0];
    const y = block[1];
    const target = nextBlockBox.childNodes[y + 1]
      ? nextBlockBox.childNodes[y + 1].childNodes[x + 1]
      : null;
    if (target) {
      target.classList.add("block", nextBlock);
    }
  });
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

function moveBlock(moveType, amount) {
  tempMovigItem[moveType] += amount;
  renderBlocks(moveType);
}

function changeDirection() {
  const direction = tempMovigItem.direction;
  direction === 3
    ? (tempMovigItem.direction = 0)
    : (tempMovigItem.direction += 1);
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

function showGameoverText() {
  gameText.style.display = "flex";
}

// event handling
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
    default:
      break;
  }
});

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none";
  score = "0";
  scoreDisplay.textContent = score;
  nextBlock = getRandomBlock();
  init();
});
