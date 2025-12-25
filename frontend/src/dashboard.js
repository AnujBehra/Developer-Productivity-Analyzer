import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";

const API_URL = "https://backend-henna-delta-87.vercel.app";

const COLORS = {
  coding: "#4CAF50",
  browsing: "#2196F3",
  break: "#FF9800",
  meeting: "#9C27B0",
  learning: "#00BCD4"
};

const ICONS = {
  coding: "💻",
  browsing: "🌐",
  break: "☕",
  meeting: "👥",
  learning: "📚"
};

export default function Dashboard({ refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/activity`);
      const summary = {};
      let total = 0;
      
      res.data.forEach(a => {
        const duration = Number(a.duration) || 0;
        summary[a.type] = (summary[a.type] || 0) + duration;
        total += duration;
      });

      setTotalMinutes(total);
      setData(Object.keys(summary).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: summary[key],
        color: COLORS[key] || "#666",
        icon: ICONS[key] || "📊"
      })));
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <h3>📊 Productivity Breakdown</h3>
        <button onClick={fetchData} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="loading">⏳ Loading data...</div>}
      
      {error && <div className="error">{error}</div>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">
          <p>📭 No activities logged yet.</p>
          <p>Start tracking your productivity above!</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{formatTime(totalMinutes)}</span>
              <span className="stat-label">Total Time</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{data.length}</span>
              <span className="stat-label">Activities</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatTime(value)}`, 'Duration']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="activity-list">
            {data.map((item, i) => (
              <div key={i} className="activity-item" style={{ borderLeft: `4px solid ${item.color}` }}>
                <span className="activity-icon">{item.icon}</span>
                <span className="activity-name">{item.name}</span>
                <span className="activity-time">{formatTime(item.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
