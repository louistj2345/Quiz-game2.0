let currentQuestion = 0;
let score = 0;
const leaderboard = [];
const quizContainer = document.getElementById("quiz-container");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");
const leaderboardEl = document.getElementById("leaderboard");

// ----------------- Quiz Logic -----------------
function loadQuestion() {
  const q = QUESTIONS[currentQuestion];
  questionEl.textContent = q.question;
  choicesEl.innerHTML = "";

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "choice-btn";
    btn.onclick = () => selectAnswer(idx);
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(idx) {
  const correct = QUESTIONS[currentQuestion].correctIndex;
  if (idx === correct) score += 1;
  scoreEl.textContent = score;
  currentQuestion++;
  if (currentQuestion < QUESTIONS.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizContainer.innerHTML = `<h2>Quiz Completed!</h2>
  <p>Your Score: ${score}/${QUESTIONS.length}</p>`;
  addToLeaderboard("You", score);
  renderLeaderboard();
}

// ----------------- Leaderboard -----------------
function addToLeaderboard(name, score) {
  leaderboard.push({name, score});
  leaderboard.sort((a,b)=>b.score-a.score);
}

function renderLeaderboard() {
  leaderboardEl.innerHTML = "";
  leaderboard.forEach(entry=>{
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardEl.appendChild(li);
  });
}

// ----------------- Start Quiz -----------------
loadQuestion();

// ----------------- Pusher Chat -----------------
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// Initialize Pusher
const pusher = new Pusher('YOUR_PUBLIC_KEY', { cluster: 'eu' });
const channel = pusher.subscribe('chat-channel');

channel.bind('chat-event', function(data) {
  const msg = document.createElement("div");
  msg.textContent = `${data.user}: ${data.message}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatSend.onclick = () => {
  const message = chatInput.value.trim();
  if(!message) return;
  fetch('https://YOUR_SERVER_OR_FUNCTION/send', { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify({ user: "You", message })
  });
  chatInput.value = "";
};
