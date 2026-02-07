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
  document.getElementById("spin").play();

  // Spin animation
  reelEls.forEach(el => {
    el.style.transform = "rotateX(360deg)";
  });

  const res = await fetch(`${API_BASE}/api/slots/spin`, { method: "POST" });
  const data = await res.json();

  setTimeout(() => {
    reelEls[0].textContent = data.reels[0];
    reelEls[1].textContent = data.reels[1];
    reelEls[2].textContent = data.reels[2];
    reelEls.forEach(el => el.style.transform = "rotateX(0deg)");

    slotResult.textContent = data.win ? `You won ${data.payout}!` : "Try again!";
    document.getElementById(data.sound).play();
  }, 500);
});

// ----------------- FISHING -----------------
const canvas = document.getElementById("fishingCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let playerScore = 0;
let fishList = [];
let players = {};

const fishImg = new Image();
fishImg.src = "images/fish.png"; // Add your fish image in /images/

const socket = io(API_BASE);

socket.on("connect", () => console.log("Connected to fishing socket:", socket.id));

socket.on("fish:init", data => { fishList = data; drawFish(); });
socket.on("fish:update", data => { fishList = data; drawFish(); });
socket.on("players:update", data => { players = data; updatePlayers(); });
socket.on("sound:event", sound => { document.getElementById(sound).play(); });

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  socket.emit("shoot", { x, y });
});

function drawFish() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fishList.forEach(f => {
    ctx.drawImage(fishImg, f.x - 20, f.y - 20, 40, 40);
  });
}

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

// Animate fish movement
setInterval(() => {
  fishList.forEach(f => {
    if(f.direction === "right") f.x += f.speed;
    if(f.direction === "left") f.x -= f.speed;
    if(f.direction === "up") f.y -= f.speed;
    if(f.direction === "down") f.y += f.speed;

    // Bounce off edges
    if(f.x < 0) f.direction = "right";
    if(f.x > canvas.width) f.direction = "left";
    if(f.y < 0) f.direction = "down";
    if(f.y > canvas.height) f.direction = "up";
  });
  drawFish();
}, 50);

// Responsive canvas resize
window.addEventListener("resize", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
