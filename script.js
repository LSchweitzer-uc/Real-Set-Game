let numbers = [];
let selected = [];
let score = 0;
let timeLeft = 120;
let timerInterval = null;
let gameActive = false;
let correct = [];

function startGame() {
  score = 0;
  timeLeft = 120;
  gameActive = true;

  generateNumbers();
  renderNumbers();

  document.getElementById("score").innerText = score;
  document.getElementById("time").innerText = timeLeft;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameActive = false;

  document.getElementById("result").innerText = "⏰ Game over! Final score: " + score;

  score=0;
}

function generateNumbers() {
  numbers = [];
  correct = [];

  while (numbers.length < 5) {
    drawCard();
    }
  

  // shuffle the array
  shuffleArray(numbers);
  ensureValidSet();

  renderNumbers();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function drawCard() {
  let newNum;
  let displayOverride = null;

  if (Math.random() < 0.001) { // 0.1% chance for a specific constant
    const constant = famousConstants[Math.floor(Math.random() * famousConstants.length)];
    newNum = constant.value;
    displayOverride = constant.display;
  } else {
    let u1 = Math.random();
    let u2 = Math.random() + 1e-12; // avoid division by zero
    let u3 = Math.random();

    newNum = u1 / u2;
    if (u3 > 0.5) newNum *= -1;
  }

  if (displayOverride) {
    numbers.push({ value: newNum, display: displayOverride });
  } else {
    numbers.push({ value: newNum });
  }
}

function renderNumbers() {
  const container = document.getElementById("numbers");
  container.innerHTML = "";
  selected = [];

  numbers.forEach((numObj, index) => {
    const btn = document.createElement("button");

    let num, displayOverride;

    if (typeof numObj === "object") {
      num = numObj.value;
      displayOverride = numObj.display || null;
    } else {
      num = numObj;
      displayOverride = null;
    }

    let displayNum;
    if (displayOverride) {
      displayNum = displayOverride; // render the constant symbol
    } else if (Math.abs(num) < 1e-6) {
      displayNum = "0...";
    } else {
      const sign = num < 0 ? "-" : "";
      const absNum = Math.abs(num);
      let numStr = absNum.toFixed(10);
      let [intPart, fracPart] = numStr.split(".");
      fracPart = fracPart.slice(0, 3);
      displayNum = `${sign}${intPart}.${fracPart}...`;
    }

    btn.innerText = displayNum;

    btn.onclick = () => {
      btn.classList.toggle("selected");
      if (selected.includes(index)) {
        selected = selected.filter(i => i !== index);
      } else {
        selected.push(index);
      }
    };

    container.appendChild(btn);
  });
}

function ensureValidSet() {
  // Step 0: if a valid set already exists, do nothing
  if (correct && correct.length > 0) return;

  // Step 1: fill numbers until there are 9 cards total
  while (numbers.length < 9) {
    drawCard();
  }

  // Step 2: pick a random subset
  const subsetSize = Math.floor(Math.random() * (numbers.length - 1)) + 2;
  const indices = [...Array(numbers.length).keys()];
  shuffleArray(indices);
  const subsetIndices = indices.slice(0, subsetSize);

  // Step 3: get the actual numeric values
  const subsetNumbers = subsetIndices.map(i => {
    const n = numbers[i];
    return typeof n === "object" ? n.value : n;
  });

  let newNum;

  if (Math.random() < 0.5) {
    // multiply subset and take inverse
    let product = subsetNumbers.reduce((acc, n) => acc * n, 1);
    if (Math.abs(product) < 1e-6) product = 1e-6; // avoid division by zero
    newNum = 1 / product;
  } else {
    // sum subset and take negative
    let sum = subsetNumbers.reduce((acc, n) => acc + n, 0);
    newNum = -sum;
  }

  // push new card (plain number)
  numbers.push(newNum);

  // store correct set as **numeric values**
  correct = [...subsetNumbers, newNum];

  shuffleArray(numbers); // shuffle all numbers after adding new one
}

function arraysApproxEqual(selectedIndices, correctNumbers, eps = 1e-6) {
  if (selectedIndices.length !== correctNumbers.length) return false;

  const selectedNums = selectedIndices.map(i => numbers[i]);

  return correctNumbers.every(cNum =>
    selectedNums.some(n => Math.abs(n - cNum) < eps)
  );
}

function submitSet() {
  if (selected.length < 3) {
    document.getElementById("result").innerText = "Pick at least 3!";
    return;
  }

  if (arraysApproxEqual(selected, correct)) {
    document.getElementById("result").innerText = "✅ Correct!";
    numbers = numbers.filter((_, i) => !selected.includes(i));
    if (gameActive) score += selected.length;
    correct = []; // clear correct set so a new one can be generated if needed
  } else {
    document.getElementById("result").innerText = "❌ Not a valid set!";
    if (gameActive) score -= 1;
  }

  ensureValidSet(); // make sure there’s always a solvable set
  renderNumbers();
  document.getElementById("score").innerText = score;
}

function stopGame() {
  if (!gameActive) return;

  endGame();
}

function handleDrawCard() {
  drawCard();          // add the number
  renderNumbers();     // update display
}


document.getElementById("submitBtn").onclick = submitSet;

generateNumbers();

const famousConstants = [
  { value: Math.PI, display: "π" },
  { value: Math.E, display: "e" },
  { value: Math.PI/Math.E, display: "π/e"},
  { value: 0.0072973525643, display: "α"},
  { value: Math.SQRT2, display: "√2" },
  { value: Math.SQRT1_2, display: "√½" },
  { value: Math.LN2, display: "ln2" },
  { value: 0.5772156649, display: "γ" },
  { value: (1 + Math.sqrt(5)) / 2, display: "φ" },
  { value: 1, display: "1" },
  { value: 0, display: "0" },
  { value: Math.exp(Math.PI), display: "e^π" }
];
