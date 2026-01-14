import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => setStatus(data.results));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <h1 className="text-3xl font-extrabold ">MonkeyType Stats</h1>
      <p>API results: {status}</p>
    </div>
  );
}

export default App;
