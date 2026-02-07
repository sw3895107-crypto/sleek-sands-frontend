const API = "https://your-backend.onrender.com";

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

let credits = 100;
const creditsEl = document.getElementById("credits");

let time = 0;
let wave = 0;
let fireworks = [];

class Animal {
  constructor(emoji, x) {
    this.emoji = emoji;
    this.x = x;
    this.y = canvas.height * 0.72;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.step = Math.random() * 10;
  }

  update() {
    this.step += 0.08;
    this.x += this.vx;
    if (this.x < 30 || this.x > canvas.width - 30) this.vx *= -1;
  }

  draw() {
    ctx.font = "34px serif";
    ctx.fillText(this.emoji, this.x, this.y + Math.sin(this.step) * 4);
  }
}

const animals = [
  new Animal("🦊", 200),
  new Animal("🐶", 350),
  new Animal("🐱", 520),
  new Animal("🐧", 700),
  new Animal("🦝", 880)
];

function skyColor() {
  const t = (Math.sin(time * 0.00015) + 1) / 2;
  return `rgb(${70+t*100},${120+t*80},${200-t*50})`;
}

function drawSky() {
  ctx.fillStyle = skyColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawOcean() {
  const top = canvas.height * 0.45;
  ctx.fillStyle = "#1e81b0";
  ctx.fillRect(0, top, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,.4)";
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 12) {
    ctx.lineTo(x, top + Math.sin((x + wave) * 0.02) * 6);
  }
  ctx.stroke();
}

function drawSand() {
  ctx.fillStyle = "#f2d16b";
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height);
}

function drawFireworks() {
  fireworks.forEach(p => {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life--;
  });
  fireworks = fireworks.filter(p => p.life > 0);
}

async function spin() {
  if (credits <= 0) return;
  credits -= 1;

  const res = await fetch(API + "/api/slots/spin", { method: "POST" });
  const data = await res.json();

  if (data.isWin) credits += data.payout;

  if (data.isBonus) {
    const bonusRes = await fetch(API + "/api/bonus", { method: "POST" });
    const bonus = await bonusRes.json();
    showBonus(bonus.reward);
  }

  creditsEl.textContent = "Credits: " + credits;
}

function showBonus(amount) {
  document.getElementById("bonusText").textContent = `You won ${amount} credits!`;
  document.getElementById("bonusModal").classList.remove("hidden");
  for (let i = 0; i < 40; i++) {
    fireworks.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 60
    });
  }
  document.getElementById("claimBonus").onclick = () => {
    credits += amount;
    creditsEl.textContent = "Credits: " + credits;
    document.getElementById("bonusModal").classList.add("hidden");
  };
}

document.getElementById("spinBtn").onclick = spin;

function animate() {
  drawSky();
  drawOcean();
  drawSand();

  animals.forEach(a => {
    a.update();
    a.draw();
  });

  drawFireworks();

  wave += 2;
  time += 16;
  requestAnimationFrame(animate);
}

animate();
