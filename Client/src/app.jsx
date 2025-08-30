import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const analyze = async () => {
    const res = await axios.post("http://localhost:5000/api/analyze", { query });
    setResult(res.data.result);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📈 MarketPulse</h1>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Enter stock ticker..." 
      />
      <button onClick={analyze}>Analyze</button>
      <p>{result}</p>
    </div>
  );
}

export default App;
