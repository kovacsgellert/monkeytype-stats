import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStatus(data.message));
  }, []);

  return (
    <div>
      <h1>MonkeyType Stats</h1>
      <p>API status: {status}</p>
    </div>
  );
}

export default App;
