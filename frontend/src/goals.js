import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "https://backend-henna-delta-87.vercel.app";

const DEFAULT_GOALS = {
  coding: 120, // 2 hours
  learning: 60, // 1 hour
  break: 30, // 30 mins
};

export default function Goals({ refreshTrigger, onActivityDeleted }) {
  const [todayActivities, setTodayActivities] = useState([]);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("dailyGoals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTodayActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/activity/today`);
      setTodayActivities(res.data);
    } catch (error) {
      // Fallback: filter from all activities
      try {
        const res = await axios.get(`${API_URL}/api/activity`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = res.data.filter(a => new Date(a.date) >= today);
        setTodayActivities(filtered);
      } catch (e) {
        console.error("Error fetching activities:", e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayActivities();
  }, [fetchTodayActivities, refreshTrigger]);

  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem("dailyGoals", JSON.stringify(newGoals));
    setShowSettings(false);
  };

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await axios.delete(`${API_URL}/api/activity/${id}`);
      setTodayActivities(prev => prev.filter(a => a._id !== id));
      if (onActivityDeleted) onActivityDeleted();
    } catch (error) {
      alert("Failed to delete activity");
    }
  };

  // Calculate today's totals
  const todayTotals = todayActivities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + (Number(a.duration) || 0);
    return acc;
  }, {});

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatTimeShort = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgress = (type) => {
    const current = todayTotals[type] || 0;
    const goal = goals[type] || 0;
    return goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  };

  const getActivityIcon = (type) => {
    const icons = { coding: "💻", learning: "📚", break: "☕", browsing: "🌐", meeting: "👥" };
    return icons[type] || "📊";
  };

  const goalTypes = ["coding", "learning", "break"];

  return (
    <div className="goals-card">
      <div className="goals-header">
        <h3>🎯 Today's Goals</h3>
        <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
          ⚙️
        </button>
      </div>

      {/* Goal Settings Modal */}
      {showSettings && (
        <div className="settings-modal">
          <h4>Set Daily Goals (minutes)</h4>
          <div className="settings-inputs">
            {goalTypes.map(type => (
              <div key={type} className="setting-row">
                <label>{getActivityIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <input
                  type="number"
                  value={goals[type] || 0}
                  onChange={(e) => setGoals({...goals, [type]: Number(e.target.value)})}
                  min="0"
                />
              </div>
            ))}
          </div>
          <div className="settings-actions">
            <button onClick={() => saveGoals(goals)} className="save-settings-btn">Save</button>
            <button onClick={() => setShowSettings(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Goal Progress */}
      <div className="goal-progress-list">
        {goalTypes.map(type => (
          <div key={type} className="goal-item">
            <div className="goal-info">
              <span className="goal-icon">{getActivityIcon(type)}</span>
              <span className="goal-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <span className="goal-time">
                {formatTime(todayTotals[type] || 0)} / {formatTime(goals[type] || 0)}
              </span>
            </div>
            <div className="goal-bar">
              <div 
                className={`goal-fill ${getProgress(type) >= 100 ? 'complete' : ''}`}
                style={{ width: `${getProgress(type)}%` }}
              ></div>
            </div>
            {getProgress(type) >= 100 && <span className="goal-check">✅</span>}
          </div>
        ))}
      </div>

      {/* Today's Activity History */}
      <div className="history-section">
        <h4>📋 Today's Activities ({todayActivities.length})</h4>
        
        {loading && <div className="loading-small">Loading...</div>}
        
        {!loading && todayActivities.length === 0 && (
          <p className="no-activities">No activities logged today. Start tracking!</p>
        )}

        {!loading && todayActivities.length > 0 && (
          <div className="history-list">
            {todayActivities.map(activity => (
              <div key={activity._id} className="history-item">
                <span className="history-icon">{getActivityIcon(activity.type)}</span>
                <div className="history-details">
                  <span className="history-type">{activity.type}</span>
                  <span className="history-time">{formatTimeShort(activity.date)}</span>
                </div>
                <span className="history-duration">{activity.duration}m</span>
                <button 
                  onClick={() => deleteActivity(activity._id)}
                  className="delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
