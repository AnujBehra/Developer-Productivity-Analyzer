import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const API_URL = "https://backend-henna-delta-87.vercel.app";

const COLORS = {
  coding: "#4CAF50",
  learning: "#2196F3",
  break: "#FF9800",
  browsing: "#9C27B0",
  meeting: "#00BCD4"
};

export default function Analytics({ refreshTrigger }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week"); // week, summary

  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    try {
      // Try weekly stats endpoint
      const res = await axios.get(`${API_URL}/api/activity/stats/weekly`);
      
      // Process aggregated data
      const dateMap = {};
      res.data.forEach(item => {
        const date = item._id.date;
        const type = item._id.type;
        if (!dateMap[date]) {
          dateMap[date] = { date, coding: 0, learning: 0, break: 0, browsing: 0, meeting: 0 };
        }
        dateMap[date][type] = item.totalDuration;
      });

      // Fill in missing days
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        result.push({
          name: dayName,
          date: dateStr,
          coding: dateMap[dateStr]?.coding || 0,
          learning: dateMap[dateStr]?.learning || 0,
          break: dateMap[dateStr]?.break || 0,
          browsing: dateMap[dateStr]?.browsing || 0,
          meeting: dateMap[dateStr]?.meeting || 0,
        });
      }

      setWeeklyData(result);
    } catch (error) {
      // Fallback: process from all activities
      try {
        const res = await axios.get(`${API_URL}/api/activity`);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const dateMap = {};
        res.data.forEach(a => {
          const d = new Date(a.date);
          if (d >= weekAgo) {
            const dateStr = d.toISOString().split('T')[0];
            if (!dateMap[dateStr]) {
              dateMap[dateStr] = { coding: 0, learning: 0, break: 0, browsing: 0, meeting: 0 };
            }
            dateMap[dateStr][a.type] = (dateMap[dateStr][a.type] || 0) + (Number(a.duration) || 0);
          }
        });

        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          
          result.push({
            name: dayName,
            date: dateStr,
            ...dateMap[dateStr] || { coding: 0, learning: 0, break: 0, browsing: 0, meeting: 0 }
          });
        }
        setWeeklyData(result);
      } catch (e) {
        console.error("Error fetching analytics:", e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData, refreshTrigger]);

  // Calculate weekly summary
  const weeklySummary = weeklyData.reduce((acc, day) => {
    acc.coding += day.coding || 0;
    acc.learning += day.learning || 0;
    acc.break += day.break || 0;
    acc.browsing += day.browsing || 0;
    acc.meeting += day.meeting || 0;
    acc.total += (day.coding || 0) + (day.learning || 0) + (day.break || 0) + (day.browsing || 0) + (day.meeting || 0);
    return acc;
  }, { coding: 0, learning: 0, break: 0, browsing: 0, meeting: 0, total: 0 });

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Calculate streaks
  const calculateStreak = () => {
    let streak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      const day = weeklyData[i];
      const total = (day.coding || 0) + (day.learning || 0);
      if (total > 0) {
        streak++;
      } else if (i < weeklyData.length - 1) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const avgDaily = weeklySummary.total / 7;
  const productiveRatio = weeklySummary.total > 0 
    ? ((weeklySummary.coding + weeklySummary.learning) / weeklySummary.total * 100).toFixed(0)
    : 0;

  if (loading) {
    return (
      <div className="analytics-card">
        <h3>📈 Weekly Analytics</h3>
        <div className="loading">⏳ Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <h3>📈 Weekly Analytics</h3>
        <div className="view-toggle">
          <button 
            className={view === "week" ? "active" : ""} 
            onClick={() => setView("week")}
          >
            Chart
          </button>
          <button 
            className={view === "summary" ? "active" : ""} 
            onClick={() => setView("summary")}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="analytics-quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-icon">🔥</span>
          <span className="quick-stat-value">{streak}</span>
          <span className="quick-stat-label">Day Streak</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-icon">⏱️</span>
          <span className="quick-stat-value">{formatTime(Math.round(avgDaily))}</span>
          <span className="quick-stat-label">Daily Avg</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-icon">📊</span>
          <span className="quick-stat-value">{productiveRatio}%</span>
          <span className="quick-stat-label">Productive</span>
        </div>
      </div>

      {view === "week" && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v}m`} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value) => [`${value} mins`]}
              />
              <Legend />
              <Bar dataKey="coding" name="Coding" fill={COLORS.coding} stackId="a" />
              <Bar dataKey="learning" name="Learning" fill={COLORS.learning} stackId="a" />
              <Bar dataKey="meeting" name="Meeting" fill={COLORS.meeting} stackId="a" />
              <Bar dataKey="break" name="Break" fill={COLORS.break} stackId="a" />
              <Bar dataKey="browsing" name="Browsing" fill={COLORS.browsing} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "summary" && (
        <div className="summary-view">
          <div className="summary-total">
            <span className="summary-total-label">Total This Week</span>
            <span className="summary-total-value">{formatTime(weeklySummary.total)}</span>
          </div>
          
          <div className="summary-breakdown">
            {Object.entries(COLORS).map(([type, color]) => (
              <div key={type} className="summary-item">
                <div className="summary-item-header">
                  <span className="summary-dot" style={{ background: color }}></span>
                  <span className="summary-type">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
                <span className="summary-time">{formatTime(weeklySummary[type] || 0)}</span>
                <div className="summary-bar">
                  <div 
                    className="summary-bar-fill" 
                    style={{ 
                      width: `${weeklySummary.total > 0 ? (weeklySummary[type] / weeklySummary.total * 100) : 0}%`,
                      background: color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
