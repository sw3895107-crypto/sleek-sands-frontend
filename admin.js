const API = "https://your-backend.onrender.com/api/admin";

function headers() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + document.getElementById("token").value
  };
}

async function loadStats() {
  const res = await fetch(API + "/stats", { headers: headers() });
  document.getElementById("stats").textContent =
    JSON.stringify(await res.json(), null, 2);
}

async function setPayout() {
  await fetch(API + "/slots/payout", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      symbol: document.getElementById("symbol").value,
      payout: Number(document.getElementById("payout").value)
    })
  });
  loadStats();
}

async function toggleBonus() {
  await fetch(API + "/bonus/toggle", {
    method: "POST",
    headers: headers()
  });
  loadStats();
}
