import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("https://sleek-sands-api0.onrender.com/health")
      .then(res => res.text())
      .then(data => setStatus(data))
      .catch(() => setStatus("API offline"));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Sleek Sands</h1>
      <p>Backend status:</p>
      <strong>{status}</strong>
    </div>
  );
}
