import { useState } from "react";
import Tracker from "./tracker";
import Dashboard from "./dashboard";
import Rewards from "./rewards";
import "./App.css";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActivitySaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Developer Productivity Analyzer</h1>
        <p>Track your coding sessions, breaks, and earn rewards!</p>
      </header>
      
      <main className="app-main">
        <Tracker onActivitySaved={handleActivitySaved} />
        <div className="dashboard-rewards-grid">
          <Dashboard refreshTrigger={refreshTrigger} />
          <Rewards refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ by Anuj Behra | © 2025</p>
      </footer>
    </div>
  );
}

export default App;
