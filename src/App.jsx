API is working.
Use this exact endpoint in the frontend:
Copy code

https://sleek-sands-api-1.onrender.com/health
Update src/App.jsx:
Copy code
Js
import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("https://sleek-sands-api-1.onrender.com/health")
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("API offline"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Sleek Sands</h1>
      <p>Backend status:</p>
      <strong>{status}</strong>
    </div>
  );
}
Commit → push → wait for Render to redeploy → refresh the frontend page.
Expected result on the live site:
Copy code

Backend status: ok
At that point: frontend build ✔
API live ✔
connection verified ✔
