const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ------------------ BEACH ELEMENTS ------------------
let waveOffset = 0;

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
  g.addColorStop(0, "#87ceeb");
  g.addColorStop(1, "#cceeff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawOcean() {
  const oceanTop = canvas.height * 0.45;
  ctx.fillStyle = "#1e81b0";
  ctx.fillRect(0, oceanTop, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 10) {
    const y = oceanTop + Math.sin((x + waveOffset) * 0.02) * 6;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawSand() {
  const sandTop = canvas.height * 0.6;
  ctx.fillStyle = "#f2d16b";
  ctx.fillRect(0, sandTop, canvas.width, canvas.height);

  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(
      Math.random() * canvas.width,
      sandTop + Math.random() * (canvas.height - sandTop),
      2,
      2
    );
  }
}

// ------------------ ANIMAL CHARACTERS ------------------
class Animal {
  constructor(emoji, x, y) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.step = Math.random() * Math.PI * 2;
  }

  update() {
    this.step += 0.05;
    this.x += this.vx;
    if (this.x < 20 || this.x > canvas.width - 20) this.vx *= -1;
  }

  draw() {
    ctx.font = "32px serif";
    ctx.fillText(this.emoji, this.x, this.y + Math.sin(this.step) * 3);
  }
}

const animals = [
  new Animal("🦊", 200, canvas.height * 0.72),
  new Animal("🐶", 350, canvas.height * 0.75),
  new Animal("🐱", 520, canvas.height * 0.7),
  new Animal("🐧", 700, canvas.height * 0.74),
  new Animal("🦀", 900, canvas.height * 0.78)
];

// ------------------ ANIMATION LOOP ------------------
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSky();
  drawOcean();
  drawSand();

  animals.forEach(a => {
    a.update();
    a.draw();
  });

  waveOffset += 1.5;
  requestAnimationFrame(animate);
}

animate();

// ------------------ UI ------------------
document.getElementById("enterBtn").onclick = () => {
  alert("Welcome to Sleek Sands Casino 🌴🎰");
};
