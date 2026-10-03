const LETTERS = ["A", "B", "C", "D"];
const TOTAL_TIME = 6 * 60;

let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let answersLog = [];
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let answered = false;
let currentCorrectIndex = 0;

const screens = {
  welcome: document.getElementById("screen-welcome"),
  quiz: document.getElementById("screen-quiz"),
  results: document.getElementById("screen-results")
};

const els = {
  btnStart: document.getElementById("btn-start"),
  btnNext: document.getElementById("btn-next"),
  btnRestart: document.getElementById("btn-restart"),
  progressBar: document.getElementById("progress-bar"),
  questionCounter: document.getElementById("question-counter"),
  timer: document.getElementById("timer"),
  questionCategory: document.getElementById("question-category"),
  questionFigure: document.getElementById("question-figure"),
  questionImage: document.getElementById("question-image"),
  questionText: document.getElementById("question-text"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  finalScore: document.getElementById("final-score"),
  resultsTitle: document.getElementById("results-title"),
  resultsMessage: document.getElementById("results-message"),
  resultsEmoji: document.getElementById("results-emoji"),
  resultsBreakdown: document.getElementById("results-breakdown"),
  confettiContainer: document.getElementById("confetti-container")
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function randomInt(max) {
  if (window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleAnswers(answers, correctAnswer) {
  let shuffled = shuffleArray(answers);
  let tries = 0;
  while (shuffled[0] === correctAnswer && tries < 20) {
    shuffled = shuffleArray(answers);
    tries++;
  }
  return shuffled;
}

function prepareQuizQuestions() {
  quizQuestions = shuffleArray(QUESTIONS).map((q) => {
    const displayAnswers = shuffleAnswers(q.answers, q.correctAnswer);
    return {
      ...q,
      displayAnswers,
      correctDisplayIndex: displayAnswers.indexOf(q.correctAnswer)
    };
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TOTAL_TIME;
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimer() {
  els.timer.textContent = `⏱️ ${formatTime(timeLeft)}`;
}

function setQuestionImage(q) {
  if (!q.image) {
    els.questionFigure.classList.add("hidden");
    return;
  }

  els.questionFigure.classList.remove("hidden");
  els.questionImage.alt = q.imageAlt || "Illustration";
  els.questionImage.onload = () => els.questionFigure.classList.remove("hidden");
  els.questionImage.onerror = () => els.questionFigure.classList.add("hidden");
  els.questionImage.src = q.image;
}

function loadQuestion() {
  answered = false;
  const q = quizQuestions[currentQuestion];
  els.progressBar.style.width = `${(currentQuestion / quizQuestions.length) * 100}%`;
  els.questionCounter.textContent = `Question ${currentQuestion + 1} / ${quizQuestions.length}`;
  els.questionCategory.textContent = q.category;
  els.questionText.textContent = q.text;
  els.feedback.classList.add("hidden");
  els.btnNext.classList.add("hidden");
  els.answers.innerHTML = "";

  setQuestionImage(q);
  currentCorrectIndex = q.correctDisplayIndex;

  q.displayAnswers.forEach((answer, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.innerHTML = `<span class="letter">${LETTERS[i]}</span><span>${answer}</span>`;
    btn.addEventListener("click", () => handleAnswer(i));
    els.answers.appendChild(btn);
  });
}

function handleAnswer(index) {
  if (answered) return;
  answered = true;
  const q = quizQuestions[currentQuestion];
  const isCorrect = index === currentCorrectIndex;

  document.querySelectorAll(".answer-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === currentCorrectIndex) btn.classList.add("correct");
    else if (i === index && !isCorrect) btn.classList.add("incorrect");
  });

  els.feedback.classList.remove("hidden", "ok", "ko");
  els.feedback.classList.add(isCorrect ? "ok" : "ko");
  els.feedback.innerHTML = isCorrect
    ? `✅ <strong>Bravo Julia !</strong> ${q.feedback}`
    : `❌ <strong>Raté…</strong> La bonne réponse était : <strong>${q.correctAnswer}</strong>`;

  if (isCorrect) score++;
  answersLog.push({ text: q.text, isCorrect });
  els.btnNext.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= quizQuestions.length) finishQuiz();
  else loadQuestion();
}

function finishQuiz() {
  clearInterval(timerInterval);
  els.progressBar.style.width = "100%";
  showScreen("results");
  els.finalScore.textContent = score;

  const pct = score / quizQuestions.length;
  els.resultsMessage.classList.remove("hero");

  if (pct === 1) {
    els.resultsEmoji.textContent = "💜";
    els.resultsMessage.textContent = "Julia, tu me connais parfaitement ! C'est officiel.";
    els.resultsMessage.classList.add("hero");
    confetti();
  } else if (pct >= 0.75) {
    els.resultsEmoji.textContent = "🌟";
    els.resultsMessage.textContent = "Presque parfait ! Tu connais déjà très bien Victor.";
    confetti();
  } else if (pct >= 0.5) {
    els.resultsEmoji.textContent = "😊";
    els.resultsMessage.textContent = "Pas mal ! Encore quelques questions et ce sera parfait.";
  } else {
    els.resultsEmoji.textContent = "📖";
    els.resultsMessage.textContent = "Il faut réviser Victor… Recommence le quiz !";
  }

  els.resultsBreakdown.innerHTML = answersLog.map((a, i) => `
    <div class="breakdown-item">${a.isCorrect ? "✅" : "❌"} Q${i + 1}. ${a.text}</div>
  `).join("");
}

function confetti() {
  els.confettiContainer.innerHTML = "";
  const colors = ["#a855f7", "#ec4899", "#fbbf24", "#22c55e", "#fff"];
  for (let i = 0; i < 50; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[randomInt(colors.length)];
    c.style.animationDelay = `${Math.random() * 2}s`;
    els.confettiContainer.appendChild(c);
  }
}

function resetQuiz() {
  prepareQuizQuestions();
  currentQuestion = 0;
  score = 0;
  answersLog = [];
  els.confettiContainer.innerHTML = "";
  showScreen("quiz");
  startTimer();
  loadQuestion();
}

els.btnStart.addEventListener("click", resetQuiz);
els.btnNext.addEventListener("click", nextQuestion);
els.btnRestart.addEventListener("click", () => showScreen("welcome"));
