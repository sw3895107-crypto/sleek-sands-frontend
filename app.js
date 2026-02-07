// ----------------- SLOTS -----------------
const reelEls = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];
const spinBtn = document.getElementById("spinBtn");
const slotResult = document.getElementById("slotResult");

const symbols = ["7", "BAR", "CHERRY", "BELL"];

// Smooth spin animation
spinBtn.addEventListener("click", async () => {
  document.getElementById("spin").play();

  // Get server result
  const res = await fetch(`${API_BASE}/api/slots/spin`, { method: "POST" });
  const data = await res.json();

  // Each reel will stop at a different time for realism
  const durations = [1500, 2000, 2500]; // milliseconds
  const startTime = performance.now();

  function spinAnimation(currentTime) {
    const elapsed = currentTime - startTime;

    reelEls.forEach((el, i) => {
      const duration = durations[i];
      if (elapsed < duration) {
        // easing out (cosine)
        const t = elapsed / duration;
        const ease = Math.cos((1 - t) * Math.PI / 2);
        const index = Math.floor(ease * symbols.length * 10) % symbols.length;
        el.textContent = symbols[index];
      } else {
        // Final symbol from server
        el.textContent = data.reels[i];
      }
    });

    if (elapsed < Math.max(...durations)) {
      requestAnimationFrame(spinAnimation);
    } else {
      slotResult.textContent = data.win ? `You won ${data.payout}!` : "Try again!";
      document.getElementById(data.sound).play();
    }
  }

  requestAnimationFrame(spinAnimation);
});
