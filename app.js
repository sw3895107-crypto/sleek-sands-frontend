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

  // Slot reel scrolling animation
  const steps = 10;
  const interval = 50;
  let counter = 0;

  const spinInterval = setInterval(() => {
    reelEls.forEach(el => {
      const symbols = ["7", "BAR", "CHERRY", "BELL"];
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    });
    counter++;
    if (counter >= steps) clearInterval(spinInterval);
  }, interval);

  // Wait then get server result
  const res = await fetch(`${API_BASE}/api/slots/spin`, { method: "POST" });
  const data = await res.json();

  setTimeout(() => {
    reelEls[0].textContent = data.reels[0];
    reelEls[1].textContent = data.reels[1];
    reelEls[2].textContent = data.reels[2];
    slotResult.textContent = data.win ? `You won ${data.payout}!` : "Try again!";
    document.getElementById(data.sound).play();
  }, steps * interval);
});

// ----------------- FISHING -----------------
const canvas = document.getElementById("fishingCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let playerScore = 0;
let fishList = [];
let players = [];
let particles = [];
let deathAnimations = [];

const fishImg = new Image();
fishImg.src = "images/fish.png";

const socket = io(API_BASE);

socket.on("connect", () => console.log("Connected to fishing socket:", socket.id));
socket.on("fish:init", data => { fishList = data; });
socket.on("fish:update", data => { fishList = data; });
socket.on("players:update", data => { players = data; updatePlayers(); });
socket.on("sound:event", sound => { document.getElementById(sound).play(); });

// Touch and click support
function handleShoot(x, y) {
  socket.emit("shoot", { x, y });
  particles.push({ x, y, life: 20 + Math.random() * 10 });
}
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  handleShoot(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  handleShoot(touch.clientX - rect.left, touch.clientY - rect.top);
});

// Fish death animation
function createDeathAnimation(f) {
  const pieces = [];
  for(let i=0;i<10;i++){
    pieces.push({
      x: f.x,
      y: f.y,
      vx: (Math.random()-0.5)*4,
      vy: (Math.random()-0.5)*4,
      life: 30
    });
  }
  deathAnimations.push(pieces);
}

// Draw everything
function drawFish() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fish
  fishList.forEach(f => {
    ctx.drawImage(fishImg, f.x - 20, f.y - 20, 40, 40);
  });

  // Particles for shooting
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255,255,255,${p.life/30})`;
    ctx.beginPath();
    ctx.arc(p.x + (Math.random()-0.5)*20, p.y + (Math.random()-0.5)*20, 3, 0, Math.PI*2);
    ctx.fill();
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);

  // Death animations
  deathAnimations.forEach((anim, i) => {
    anim.forEach(p => {
      ctx.fillStyle = `rgba(255,100,0,${p.life/30})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life--;
    });
    if(anim.every(p=>p.life<=0)) deathAnimations.splice(i,1);
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
    if(f.direction==="right") f.x+=f.speed;
    if(f.direction==="left") f.x-=f.speed;
    if(f.direction==="up") f.y-=f.speed;
    if(f.direction==="down") f.y+=f.speed;

    if(f.x<0) f.direction="right";
    if(f.x>canvas.width) f.direction="left";
    if(f.y<0) f.direction="down";
    if(f.y>canvas.height) f.direction="up";
  });
  drawFish();
}, 50);

// Responsive canvas
window.addEventListener("resize", ()=>{
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
