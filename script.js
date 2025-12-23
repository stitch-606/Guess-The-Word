// Setting Game Name
let gameName = "Guess The Word";
document.title = gameName;
document.querySelector("h1").innerHTML = gameName;
document.querySelector("footer").innerHTML = `${gameName} Created By Stitch All Rights Reserved.`;

// Setting Game Options
let numbersOfTries = 6;
let numbersOfLetters;
let currentTry = 1;

// Protected Hints Counter - Cannot be modified from console
let _numberOfHints = 3;
Object.defineProperty(window, 'numberOfHints', {
  get() {
    return _numberOfHints;
  },
  set(value) {
    console.warn("⚠️ Hint count cannot be modified!");
    return false;
  },
  configurable: false
});

// Score Tracking
let wordsGuessed = 0;
let wordsPlayed = 0;

// Manage Words
let wordToGuess = "";
// Use words from the external `words.js` file. Support either a simple string list
// or objects with `{word, category}`. Fallback to a small list if `WORDS` isn't defined.
let wordCategory = "General";
const wordsList = (typeof WORDS !== 'undefined' && Array.isArray(WORDS) && WORDS.length > 0)
  ? WORDS
  : ["apple", "train", "computer", "banana"];
const wordEntries = wordsList
  .map((w) => {
    if (typeof w === "string") return { word: w, category: "General" };
    if (w && typeof w.word === "string") return { word: w.word, category: w.category || "General" };
    return null;
  })
  .filter(Boolean);
const chosenEntry = wordEntries[Math.floor(Math.random() * wordEntries.length)];
wordToGuess = chosenEntry.word.toLowerCase();
wordCategory = chosenEntry.category || "General";
// Show category on the page (element added in `index.html`)
const categoryEl = document.querySelector(".category-name");
if (categoryEl) categoryEl.innerText = wordCategory;
// Use the chosen word's length so the number of letters is dynamic
numbersOfLetters = wordToGuess.length;
let messageArea = document.querySelector(".message");

// Manage Hints
document.querySelector(".hint span").innerHTML = numberOfHints;
const getHintButton = document.querySelector(".hint");
getHintButton.addEventListener("click", getHint);

// Protect Hint Button from HTML tampering
// Monitor for any attempts to remove the disabled attribute
const hintButtonObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
      if (_numberOfHints === 0 && !getHintButton.hasAttribute('disabled')) {
        getHintButton.setAttribute('disabled', '');
        console.warn("⚠️ Hint button tampering detected and blocked!");
      }
    }
  });
});

hintButtonObserver.observe(getHintButton, {
  attributes: true,
  attributeFilter: ['disabled']
});

function generateInput() {
  const inputsContainer = document.querySelector(".inputs");

  // Create Main Try Div
  for (let i = 1; i <= numbersOfTries; i++) {
    const tryDiv = document.createElement("div");
    tryDiv.classList.add(`try-${i}`);
    tryDiv.innerHTML = `<span>Try ${i}</span>`;

    if (i !== 1) tryDiv.classList.add("disabled-inputs");

    // Create Inputes
    for (let j = 1; j <= numbersOfLetters; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = `guess-${i}-letter-${j}`;
      input.setAttribute("maxlength", "1");
      tryDiv.appendChild(input);
    }

    inputsContainer.appendChild(tryDiv);
  }
  // Focus On First Input In First Try Element
  inputsContainer.children[0].children[1].focus();

  // Disable All Inputs Except First One
  const inputsInDisabledDiv = document.querySelectorAll(".disabled-inputs input");
  inputsInDisabledDiv.forEach((input) => (input.disabled = true));

  const inputs = document.querySelectorAll("input");
  inputs.forEach((input, index) => {
    // Convert Input To Uppercase
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
      // console.log(index);
      const nextInput = inputs[index + 1];
      if (nextInput) nextInput.focus();
    });

    input.addEventListener("keydown", function (event) {
      // console.log(event);
      const currentIndex = Array.from(inputs).indexOf(event.target); // Or this
      // console.log(currentIndex);
      if (event.key === "ArrowRight") {
        const nextInput = currentIndex + 1;
        if (nextInput < inputs.length) inputs[nextInput].focus();
      }
      if (event.key === "ArrowLeft") {
        const prevInput = currentIndex - 1;
        if (prevInput >= 0) inputs[prevInput].focus();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        guessButton.click();
      }
    });
  });
}

const guessButton = document.querySelector(".check");
guessButton.addEventListener("click", handleGuesses);

const tryAgainButton = document.querySelector(".try-again");
tryAgainButton.addEventListener("click", restartGame);

console.log(wordToGuess);

function handleGuesses() {
  let successGuess = true;
  console.log(wordToGuess);
  for (let i = 1; i <= numbersOfLetters; i++) {
    const inputField = document.querySelector(`#guess-${currentTry}-letter-${i}`);
    const letter = inputField.value.toLowerCase();
    const actualLetter = wordToGuess[i - 1];

    // Game Logic
    if (letter === actualLetter) {
      // Letter Is Correct And In Place
      inputField.classList.add("yes-in-place");
    } else if (wordToGuess.includes(letter) && letter !== "") {
      // Letter Is Correct And Not In Place
      inputField.classList.add("not-in-place");
      successGuess = false;
    } else {
      inputField.classList.add("no");
      successGuess = false;
    }
  }

  // Check If User Win Or Lose
  if (successGuess) {
    messageArea.innerHTML = `You Win The Word Is <span>${wordToGuess}</span>`;
    if (_numberOfHints === 2) {
      messageArea.innerHTML = `<p>Congratz You Didn't Use Hints</p>`;
    }

    // Increment words guessed
    wordsGuessed++;
    wordsPlayed++;
    updateScoreDisplay();

    // Add Disabled Class On All Try Divs
    let allTries = document.querySelectorAll(".inputs > div");
    allTries.forEach((tryDiv) => tryDiv.classList.add("disabled-inputs"));

    // Disable Guess Button and show Try Again button
    guessButton.disabled = true;
    getHintButton.disabled = true;
    tryAgainButton.style.display = "block";
    
    if (_numberOfHints === 3) {
      messageArea.innerHTML = `<p>Congratz You Didn't Use Hints</p>`;
    }
  } else {
    document.querySelector(`.try-${currentTry}`).classList.add("disabled-inputs");
    const currentTryInputs = document.querySelectorAll(`.try-${currentTry} input`);
    currentTryInputs.forEach((input) => (input.disabled = true));

    currentTry++;

    const nextTryInputs = document.querySelectorAll(`.try-${currentTry} input`);
    nextTryInputs.forEach((input) => (input.disabled = false));

    let el = document.querySelector(`.try-${currentTry}`);
    if (el) {
      document.querySelector(`.try-${currentTry}`).classList.remove("disabled-inputs");
      el.children[1].focus();
    } else {
      // Increment words played (but not guessed)
      wordsPlayed++;
      updateScoreDisplay();

      // Disable Guess Button and show Try Again button
      guessButton.disabled = true;
      getHintButton.disabled = true;
      tryAgainButton.style.display = "block";
      messageArea.innerHTML = `You Lose The Word Is <span>${wordToGuess}</span>`;
    }
  }
}

function getHint() {
  if (_numberOfHints > 0) {
    _numberOfHints--;
    document.querySelector(".hint span").innerHTML = _numberOfHints;
  }
  if (_numberOfHints === 0) {
    getHintButton.disabled = true;
  }

  const enabledInputs = document.querySelectorAll("input:not([disabled])");
  const emptyEnabledInputs = Array.from(enabledInputs).filter((input) => input.value === "");

  if (emptyEnabledInputs.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyEnabledInputs.length);
    const randomInput = emptyEnabledInputs[randomIndex];
    // Determine letter position from the input id `guess-<try>-letter-<pos>` and fill accordingly
    const idParts = randomInput.id.split("-");
    const pos = parseInt(idParts[idParts.length - 1], 10);
    if (!isNaN(pos)) {
      randomInput.value = wordToGuess[pos - 1].toUpperCase();
    }
  }
}

function handleBackspace(event) {
  if (event.key === "Backspace") {
    const inputs = document.querySelectorAll("input:not([disabled])");
    const currentIndex = Array.from(inputs).indexOf(document.activeElement);
    // console.log(currentIndex);
    if (currentIndex > 0) {
      const currentInput = inputs[currentIndex];
      const prevInput = inputs[currentIndex - 1];
      currentInput.value = "";
      prevInput.value = "";
      prevInput.focus();
    }
  }
}

function restartGame() {
  // Reset game state
  const newChosen = wordEntries[Math.floor(Math.random() * wordEntries.length)];
  wordToGuess = newChosen.word.toLowerCase();
  wordCategory = newChosen.category || "General";
  numbersOfLetters = newChosen.word.length;
  currentTry = 1;
  
  // Set hints based on wins: 1 after 15 wins, 2 after 11 wins, 3 by default
  if (wordsGuessed >= 15) {
    _numberOfHints = 1;
  } else if (wordsGuessed >= 11) {
    _numberOfHints = 2;
  } else {
    _numberOfHints = 3;
  }
  
  // Set tries to 5 if 7 wins reached, otherwise 6
  numbersOfTries = wordsGuessed >= 7 ? 5 : 6;
  
  // Clear message and inputs
  messageArea.innerHTML = "";
  document.querySelector(".inputs").innerHTML = "";
  
  // Update hint display and re-enable buttons
  document.querySelector(".hint span").innerHTML = _numberOfHints;
  guessButton.disabled = false;
  getHintButton.disabled = false;
  tryAgainButton.style.display = "none";
  // Update category display
  const categoryDisplay = document.querySelector(".category-name");
  if (categoryDisplay) categoryDisplay.innerText = wordCategory;
  
  // Generate new inputs and focus
  generateInput();
  console.log(wordToGuess);
}

document.addEventListener("keydown", handleBackspace);

window.onload = function () {
  // Start the loader (if available) while we prepare the UI
  if (window.Loader && typeof Loader.start === 'function') Loader.start();

  generateInput();

  // Stop loader and hide loading container once UI is ready
  setTimeout(() => {
    if (window.Loader && typeof Loader.stop === 'function') Loader.stop();
    const loadingContainer = document.getElementById("loadingContainer");
    if (loadingContainer) {
      loadingContainer.classList.add("hidden");
    }
  }, 600); // short delay so loader is visible briefly
};

// Score Management Functions
function updateScoreDisplay() {
  document.querySelector(".words-guessed").innerHTML = wordsGuessed;
  document.querySelector(".words-played").innerHTML = wordsPlayed;
}