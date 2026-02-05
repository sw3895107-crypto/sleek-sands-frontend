import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("https://sleek-sands-backend.onrender.com/health")
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setStatus(data.status || "online");
      })
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
