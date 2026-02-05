import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Connecting to API...");

  useEffect(() => {
    fetch("https://sleek-sands-api0.onrender.com/health")
      .then(res => res.text())
      .then(data => setStatus(data))
      .catch(() => setStatus("API offline"));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Sleek Sands</h1>
      <p>Backend:</p>
      <strong>{status}</strong>
    </div>
  );
}

export default App;
