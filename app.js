import io from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

// Backend URL
const API_BASE = "https://your-backend.onrender.com";

// ----------------- SLOTS -----------------
const reelEls = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];
const spinBtn = document.getElementById("spinBtn");
const slotResult = document.getElementById("slotResult");

spinBtn.addEventListener("click", async () => {
  const res = await fetch(`${API_BASE}/api/slots/spin`, {
    method: "POST"
  });
  const data = await res.json();

  reelEls[0].textContent = data.reels[0];
  reelEls[1].textContent = data.reels[1];
  reelEls[2].textContent = data.reels[2];

  slotResult.textContent = data.win ? `You won ${data.payout}!` : "Try again!";

  document.getElementById(data.sound).play();
});

// ----------------- FISHING -----------------
const canvas = document.getElementById("fishingCanvas");
const ctx = canvas.getContext("2d");
let playerScore = 0;
let fishList = [];
let players = {};

const socket = io(API_BASE);

socket.on("connect", () => console.log("Connected to fishing socket:", socket.id));

socket.on("fish:init", data => { fishList = data; drawFish(); });
socket.on("fish:update", data => { fishList = data; drawFish(); });
socket.on("players:update", data => { players = data; updatePlayers(); });
socket.on("sound:event", sound => { document.getElementById(sound).play(); });

// Shoot fish
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  socket.emit("shoot", { x, y });
});

// Draw fish
function drawFish() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fishList.forEach(f => {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(f.x, f.y, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Update players
function updatePlayers() {
  playerScore = players[socket.id]?.score || 0;
  document.getElementById("score").textContent = playerScore;

  const listEl = document.getElementById("playersList");
  listEl.innerHTML = "";
  Object.values(players).forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.id} – ${p.score}`;
    listEl.appendChild(li);
  });
}

// Animate fish (simple movement)
setInterval(() => {
  fishList.forEach(f => {
    if(f.direction === "right") f.x += f.speed;
    if(f.direction === "left") f.x -= f.speed;
    if(f.direction === "up") f.y -= f.speed;
    if(f.direction === "down") f.y += f.speed;

    // Keep inside canvas
    f.x = Math.max(0, Math.min(canvas.width, f.x));
    f.y = Math.max(0, Math.min(canvas.height, f.y));
  });
  drawFish();
}, 50);
