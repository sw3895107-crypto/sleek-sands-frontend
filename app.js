import io from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const API_BASE = "https://your-backend.onrender.com";

// ----------------- SLOTS -----------------
const reelEls = [
  document.getElementById("reel1").querySelector("img"),
  document.getElementById("reel2").querySelector("img"),
  document.getElementById("reel3").querySelector("img")
];

const spinBtn = document.getElementById("spinBtn");
const slotResult = document.getElementById("slotResult");

const symbols = [
  { name: "7", img: "images/7.png" },
  { name: "BAR", img: "images/BAR.png" },
  { name: "CHERRY", img: "images/CHERRY.png" },
  { name: "BELL", img: "images/BELL.png" }
];

spinBtn.addEventListener("click", async () => {
  document.getElementById("spin").play();

  const res = await fetch(`${API_BASE}/api/slots/spin`, { method: "POST" });
  const data = await res.json();

  const durations = [1500, 2000, 2500];
  const startTime = performance.now();

  function spinAnimation(currentTime) {
    const elapsed = currentTime - startTime;

    reelEls.forEach((el, i) => {
      const duration = durations[i];
      if (elapsed < duration) {
        const t = elapsed / duration;
        const ease = Math.cos((1 - t) * Math.PI / 2);
        const index = Math.floor(ease * symbols.length * 10) % symbols.length;
        el.src = symbols[index].img;
        el.style.transform = `translateY(${Math.sin(t * Math.PI * 10) * 10}px)`;
      } else {
        const finalSymbol = symbols.find(s => s.name === data.reels[i]);
        el.src = finalSymbol.img;
        el.style.transform = "translateY(0px)";
      }
    });

    if (elapsed < Math.max(...durations)) {
      requestAnimationFrame(spinAnimation);
    } else {
      slotResult.textContent = data.win ? `You won ${data.payout}!` : "Try again!";
      document.getElementById(data.sound).play();

      // Remove previous glow
      reelEls.forEach(el => el.parentElement.classList.remove("win"));

      // Highlight winning reels
      if (data.win) {
        reelEls.forEach((el, i) => {
          if (data.reels.every(r => r === data.reels[0])) {
            el.parentElement.classList.add("win");
          }
        });
        setTimeout(() => {
          reelEls.forEach(el => el.parentElement.classList.remove("win"));
        }, 2000);
      }
    }
  }

  requestAnimationFrame(spinAnimation);
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

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("fish:init", data => fishList = data);
socket.on("fish:update", data => fishList = data);
socket.on("players:update", data => { players = data; updatePlayers(); });
socket.on("sound:event", sound => { document.getElementById(sound).play(); });

function handleShoot(x, y) {
  socket.emit("shoot", { x, y });
  particles.push({ x, y, life: 20 + Math.random() * 10 });

  fishList.forEach(f => {
    if (Math.abs(f.x - x) < 40 && Math.abs(f.y - y) < 40) {
      for (let i = 0; i < 10; i++) {
        deathAnimations.push({
          x: f.x, y: f.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 30
        });
      }
    }
  });
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

function drawFish() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fishList.forEach(f => ctx.drawImage(fishImg, f.x - 20, f.y - 20, 40, 40));

  particles.forEach(p => {
    ctx.fillStyle = `rgba(255,255,255,${p.life / 30})`;
    ctx.beginPath();
    ctx.arc(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20, 3, 0, Math.PI * 2);
    ctx.fill();
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);

  deathAnimations.forEach((p, i) => {
    ctx.fillStyle = `rgba(255,100,0,${p.life / 30})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
  });
  deathAnimations = deathAnimations.filter(p => p.life > 0);
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

setInterval(() => {
  fishList.forEach(f => {
    if (f.direction === "right") f.x += f.speed;
    if (f.direction === "left") f.x -= f.speed;
    if (f.direction === "up") f.y -= f.speed;
    if (f.direction === "down") f.y += f.speed;

    if (f.x < 0) f.direction = "right";
    if (f.x > canvas.width) f.direction = "left";
    if (f.y < 0) f.direction = "down";
    if (f.y > canvas.height) f.direction = "up";
  });
  drawFish();
}, 50);

window.addEventListener("resize", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
