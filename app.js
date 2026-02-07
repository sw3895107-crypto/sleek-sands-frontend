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

  reelEls.forEach(el => el.style.transform = "rotateX(360deg)");

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
canvas.height = canvas
