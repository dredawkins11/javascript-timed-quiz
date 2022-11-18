const timerEl = document.getElementById("timer");
const viewHighscoreEl = document.getElementById("view-highscores");
const headerEl = document.getElementById("header");
const questionEl = document.getElementById("question");
const answerChoicesEl = document.getElementById("answer-choice-container");
const initialsFormEl = document.getElementById("initials-form");
const feedbackTextEl = document.getElementById("answer-feedback");

const TIME_LIMIT = 60;

// Create a "state" object to manage the current prompt, the score, the timer, and the highscores.
const state = {
    currentPrompt: 0,
    score: 0,
    highscores: [],
    time: TIME_LIMIT,
    timer: undefined,
};

// Hold available prompts (and questions) in an array
const prompts = [
    {
        text: "Press the button below to start your quiz!",
        choices: ["Start Quiz"],
        correct: 0,
    },
    {
        text: "Inside which HTML element do we put the JavaScript?",
        choices: ["<scripting>", "<javascript>", "<script>", "<js>"],
        correct: 2,
    },
    {
        text: 'How do you write "Hello World" in an alert box?',
        choices: [
            'alert("Hello World");',
            'alertBox("Hello World");',
            'msgBox("Hello World");',
            'msg("Hello World");',
        ],
        correct: 0,
    },
    {
        text: "Which of the following is a correct function declaration?",
        choices: [
            "function = myFunction()",
            "function:myFunction()",
            "function myFunction()",
        ],
        correct: 2,
    },
    {
        text: "Which is correct syntax for starting a FOR loop?",
        choices: [
            "for i = 1 to 5",
            "for (i = 0; i <= 5)",
            "for (i = 0; i <= 5; i++)",
            "for (i <= 5; i++)",
        ],
        correct: 2,
    },
    {
        text: "How do you add a comment to JavaScript code?",
        choices: [
            '"This is a comment"',
            "<!-- This is a comment -->",
            "// This is a comment",
            "!! This is a comment !!",
        ],
        correct: 2,
    },
];

// Add event listener to the display highscores text
viewHighscoreEl.addEventListener("click", displayScores);

// Listen for click events on any of the answer choices. Different results depending on state.
answerChoicesEl.addEventListener("click", (event) => {
    const targetClasses = event.target.classList;
    if (targetClasses.contains("back")) {
        if (state.currentPrompt === 0) return returnToStart();
        renderQuestion();
        return;
    }
    if (targetClasses.contains("clear")) {
        state.highscores = [];
        displayScores();
        return;
    }
    if (targetClasses.contains("start")) {
        state.timer = setInterval(updateTimer, 1000);
    }
    if (!targetClasses.contains("answer-choice-item")) return;

    if (state.currentPrompt === 0) return nextQuestion();
    checkAnswerValidity(
        Array.from(answerChoicesEl.children).indexOf(event.target)
    );
    nextQuestion();
});

// Listen for the submit event on the initials form
initialsFormEl.addEventListener("submit", (event) => {
    event.preventDefault();

    state.highscores.push({
        initials: event.target.children[0].value,
        value: ((state.score / (prompts.length - 1)) * 100).toFixed(2),
    });

    initialsFormEl.setAttribute("style", "display: none;");

    returnToStart();
});

// Progress to the next question (or prompt) by modifying state and rendering new text
function nextQuestion() {
    if (state.currentPrompt === prompts.length - 1) {
        finishQuiz();
        return;
    }
    state.currentPrompt++;

    renderQuestion();
}

// Reuseable function for rendering the question determined by the state's current prompt
function renderQuestion() {
    headerEl.innerHTML = `Question ${state.currentPrompt}`;
    questionEl.innerHTML = prompts[state.currentPrompt].text;

    answerChoicesEl.innerHTML = "";
    prompts[state.currentPrompt].choices.forEach((choice) => {
        answerChoicesEl.append(createAnswerChoice(choice));
    });
}

// Display finish screen with intial form and stop timer
function finishQuiz() {
    clearInterval(state.timer);

    headerEl.innerHTML = `You finished with a score of ${(
        (state.score / (prompts.length - 1)) *
        100
    ).toFixed(2)}%`;
    questionEl.innerHTML = "Enter your intials below to save your score!";
    answerChoicesEl.innerHTML = "";
    feedbackTextEl.innerHTML = "";

    initialsFormEl.setAttribute("style", "display: flex;");
}

// Return to the title screen by changing text and resetting state
function returnToStart() {
    resetQuizState();

    headerEl.innerHTML = "JavaScript Quiz";
    questionEl.innerHTML = "Press start below to begin your quiz!";
    feedbackTextEl.innerHTML = "";
    answerChoicesEl.innerHTML = "";

    const startQuizEl = document.createElement("button");
    startQuizEl.classList.add("answer-choice-item", "start");
    startQuizEl.innerHTML = "Start Quiz";
    answerChoicesEl.append(startQuizEl);
}

// Create an answer choice <button> element based on a given text
function createAnswerChoice(text) {
    const answerChoice = document.createElement("button");
    answerChoice.classList.add("answer-choice-item");
    answerChoice.textContent = text;

    return answerChoice;
}

// Check whether an answer is correct and display results to a <p> element
function checkAnswerValidity(index) {
    let correct = prompts[state.currentPrompt].correct == index;
    if (correct) {
        state.score++;
        feedbackTextEl.innerHTML = "<span style=\"color: lightgreen;\">Correct! Keep it up!</span>";
        return;
    } else {
        state.time -= 5
        feedbackTextEl.innerHTML = "<span style=\"color: lightcoral;\">Incorrect! 5 seconds lost in time!</span>";
    }
}

// Display the highscore screen and sort the highscores
function displayScores() {
    headerEl.innerHTML = "Highscores:";
    questionEl.innerHTML = "";
    feedbackTextEl.innerHTML = "";

    const sortedScores = [...state.highscores].sort((a, b) => {
        return b.value - a.value;
    });
    sortedScores.forEach((score, i) => {
        questionEl.innerHTML += `${i + 1}. ${score.initials} - ${
            score.value
        }\n<hr>\n`;
    });

    const clearScoreEl = document.createElement("button");
    const goBackEl = document.createElement("button");

    clearScoreEl.classList.add("answer-choice-item", "clear");
    goBackEl.classList.add("answer-choice-item", "back");

    clearScoreEl.innerHTML = "Clear highscores";
    goBackEl.innerHTML = "Go back to quiz";

    answerChoicesEl.innerHTML = "";
    answerChoicesEl.append(clearScoreEl, goBackEl);
}

// Update timer element and end game if timer reaches zero
function updateTimer() {
    if (state.time <= 0) {
        finishQuiz();
        clearInterval(state.timer);
        return;
    }

    state.time--;
    timerEl.innerHTML = `Time left: ${state.time}s`;
}

function resetQuizState() {
    state.time = TIME_LIMIT;
    state.score = 0;
    state.currentPrompt = 0;
    timerEl.innerHTML = `Time left: ${TIME_LIMIT}s`;
}
