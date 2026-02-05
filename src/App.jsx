import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("1https://sleek-sands-backend.onrender.com")
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Sleek Sands</h1>
      <h2>Backend status: {status}</h2>
    </div>
  );
}

export default App;
