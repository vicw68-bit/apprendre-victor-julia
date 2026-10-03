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

  questionText: document.getElementById("question-text"),

  answers: document.getElementById("answers"),

  feedback: document.getElementById("feedback"),

  finalScore: document.getElementById("final-score"),

  resultsMessage: document.getElementById("results-message"),

  resultsEmoji: document.getElementById("results-emoji"),

  resultsBreakdown: document.getElementById("results-breakdown"),

  confettiContainer: document.getElementById("confetti-container")

};



/** Images par libellé (secours si ancien format answers[]). */

const CHOICE_IMAGES = {

  Jul: "images/answers/musique-jul.jpg",

  Timal: "images/answers/musique-timal.jpg",

  SCH: "images/answers/musique-sch.jpg",

  PLK: "images/answers/musique-plk.jpg",

  Pizza: "images/answers/plat-pizza.jpg",

  Sushi: "images/answers/plat-sushi.jpg",

  Tacos: "images/answers/plat-tacos.jpg",

  Raclette: "images/answers/plat-raclette.jpg",

  Avatar: "images/answers/cinema-avatar.jpg",

  "Le loup de Wall Street": "images/answers/cinema-loup.jpg",

  "Project X": "images/answers/cinema-projectx.jpg",

  Interstellar: "images/answers/cinema-interstellar.jpg",

  Football: "images/answers/sport-foot.jpg",

  Basket: "images/answers/sport-basket.jpg",

  Ski: "images/answers/sport-ski.jpg",

  Escalade: "images/answers/sport-escalade.jpg",

  Bleu: "images/answers/couleur-bleu.jpg",

  Rouge: "images/answers/couleur-rouge.jpg",

  Vert: "images/answers/couleur-vert.jpg",

  Noir: "images/answers/couleur-noir.jpg",

  Printemps: "images/answers/saison-printemps.jpg",

  "Été": "images/answers/saison-ete.jpg",

  Automne: "images/answers/saison-automne.jpg",

  Hiver: "images/answers/saison-hiver.jpg",

  Monster: "images/answers/boisson-monster.jpg",

  Oasis: "images/answers/boisson-oasis.jpg",

  Coca: "images/answers/boisson-coca.jpg",

  "Root Beer": "images/answers/boisson-rootbeer.jpg",

  Vertige: "images/answers/phobie-vertige.jpg",

  "Eau profonde": "images/answers/phobie-eau.jpg",

  Araignée: "images/answers/phobie-araignee.jpg",

  Serpent: "images/answers/phobie-serpent.jpg"

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



function normalizeChoices(q) {

  if (Array.isArray(q.choices) && q.choices.length === 4) {

    return q.choices.map((c) => ({

      label: c.label,

      image: c.image || CHOICE_IMAGES[c.label] || "",

      imageAlt: c.imageAlt || c.label

    }));

  }

  if (Array.isArray(q.answers) && q.answers.length === 4) {

    return q.answers.map((label) => ({

      label,

      image: CHOICE_IMAGES[label] || "",

      imageAlt: label

    }));

  }

  return [];

}



function shuffleChoices(choices, correctLabel) {

  if (!choices.length) return [];

  let shuffled = shuffleArray(choices);

  let tries = 0;

  while (shuffled[0].label === correctLabel && tries < 20) {

    shuffled = shuffleArray(choices);

    tries++;

  }

  return shuffled;

}



function prepareQuizQuestions() {

  quizQuestions = shuffleArray(QUESTIONS).map((q) => {

    const baseChoices = normalizeChoices(q);

    const displayChoices = shuffleChoices(baseChoices, q.correctAnswer);

    const correctDisplayIndex = displayChoices.findIndex((c) => c.label === q.correctAnswer);

    return {

      ...q,

      displayChoices,

      correctDisplayIndex: correctDisplayIndex >= 0 ? correctDisplayIndex : 0

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



function createChoiceCard(choice, index) {

  const btn = document.createElement("button");

  btn.type = "button";

  btn.className = "choice-card";

  btn.setAttribute("aria-label", choice.label);



  const imgWrap = document.createElement("span");

  imgWrap.className = "choice-img-wrap";

  if (choice.image) {

    const img = document.createElement("img");

    img.src = choice.image;

    img.alt = choice.imageAlt || choice.label;

    img.loading = "lazy";

    img.onerror = () => img.classList.add("img-missing");

    imgWrap.appendChild(img);

  }



  const label = document.createElement("span");

  label.className = "choice-label";

  label.textContent = choice.label;



  btn.append(imgWrap, label);

  btn.addEventListener("click", () => handleAnswer(index));

  return btn;

}



function loadQuestion() {

  answered = false;

  const q = quizQuestions[currentQuestion];

  if (!q) return;



  els.progressBar.style.width = `${(currentQuestion / quizQuestions.length) * 100}%`;

  els.questionCounter.textContent = `Question ${currentQuestion + 1} / ${quizQuestions.length}`;

  els.questionCategory.textContent = q.category;

  els.questionText.textContent = q.text;

  els.feedback.classList.add("hidden");

  els.btnNext.classList.add("hidden");

  els.answers.innerHTML = "";



  const choices = q.displayChoices?.length ? q.displayChoices : normalizeChoices(q);

  currentCorrectIndex = choices.findIndex((c) => c.label === q.correctAnswer);

  if (currentCorrectIndex < 0) currentCorrectIndex = 0;



  choices.forEach((choice, i) => {

    els.answers.appendChild(createChoiceCard(choice, i));

  });

}



function handleAnswer(index) {

  if (answered) return;

  answered = true;

  const q = quizQuestions[currentQuestion];

  const isCorrect = index === currentCorrectIndex;



  document.querySelectorAll(".choice-card").forEach((btn, i) => {

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

