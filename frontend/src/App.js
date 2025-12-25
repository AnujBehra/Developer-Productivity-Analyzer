import { useState } from "react";
import Tracker from "./tracker";
import Dashboard from "./dashboard";
import Rewards from "./rewards";
import Goals from "./goals";
import Analytics from "./analytics";
import Focus from "./focus";
import Insights from "./insights";
import "./App.css";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleActivitySaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleActivityDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Developer Productivity Analyzer</h1>
        <p>Track your coding sessions, set goals, and earn rewards!</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <button 
          className={activeTab === "dashboard" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === "goals" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("goals")}
        >
          🎯 Goals
        </button>
        <button 
          className={activeTab === "analytics" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Analytics
        </button>
        <button 
          className={activeTab === "focus" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("focus")}
        >
          🎯 Focus
        </button>
        <button 
          className={activeTab === "insights" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("insights")}
        >
          🤖 AI Insights
        </button>
        <button 
          className={activeTab === "rewards" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("rewards")}
        >
          🏆 Rewards
        </button>
      </nav>
      
      <main className="app-main">
        <Tracker onActivitySaved={handleActivitySaved} />
        
        {activeTab === "dashboard" && (
          <Dashboard refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === "goals" && (
          <Goals 
            refreshTrigger={refreshTrigger} 
            onActivityDeleted={handleActivityDeleted}
          />
        )}
        
        {activeTab === "analytics" && (
          <Analytics refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === "focus" && (
          <Focus refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === "insights" && (
          <Insights refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === "rewards" && (
          <Rewards refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}

export default App;
