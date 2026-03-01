let currentQuestion = 0;
let localScore = 0;
const playerName = prompt("Enter your player name") || "Player 1";

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const questionBox = document.getElementById("question-box");
const choicesBox = document.getElementById("choices");
const scoresList = document.getElementById("scoresList");

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// ✅ Pusher Setup with your public key
const pusher = new Pusher('f843538acc5a6d09df2c', { cluster: 'eu' });
const channel = pusher.subscribe('quiz-room');

// Listen for score updates
channel.bind('quiz-event', data => {
  updateScores(data);
});

// Listen for chat messages
channel.bind('chat-event', data => {
  updateChat(data);
});

// Start quiz
startBtn.onclick = () => {
  startBtn.style.display = "none";
  showQuestion();
};

// Next button
nextBtn.onclick = () => {
  currentQuestion++;
  if(currentQuestion < QUESTIONS.length){
    showQuestion();
  } else {
    alert(`Quiz finished! Your score: ${localScore}`);
    currentQuestion = 0;
    localScore = 0;
    questionBox.innerHTML = "";
    choicesBox.innerHTML = "";
    startBtn.style.display = "block";
  }
};

// Send chat message
sendChatBtn.onclick = () => {
  const msg = chatInput.value.trim();
  if(msg) sendChat({ player: playerName, message: msg });
  chatInput.value = "";
};

function showQuestion(){
  const q = QUESTIONS[currentQuestion];
  questionBox.textContent = q.question;
  choicesBox.innerHTML = "";
  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(i);
    choicesBox.appendChild(btn);
  });
}

function checkAnswer(selected){
  const correct = QUESTIONS[currentQuestion].correctIndex;
  if(selected === correct){
    localScore++;
    sendScoreUpdate({ player: playerName, score: localScore });
  }
  nextBtn.click();
}

// Send score to server (Netlify function)
async function sendScoreUpdate(data){
  await fetch("/.netlify/functions/sendEvent", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
}

// Send chat to server (Netlify function)
async function sendChat(data){
  await fetch("/.netlify/functions/sendChat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
}

// Update scoreboard
function updateScores(data){
  let existing = Array.from(scoresList.children).find(li => li.dataset.player === data.player);
  if(existing){
    existing.textContent = `${data.player}: ${data.score}`;
  } else {
    const li = document.createElement("li");
    li.dataset.player = data.player;
    li.textContent = `${data.player}: ${data.score}`;
    scoresList.appendChild(li);
  }
}

// Update chat
function updateChat(data){
  const msg = document.createElement("div");
  msg.textContent = `${data.player}: ${data.message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
    }
