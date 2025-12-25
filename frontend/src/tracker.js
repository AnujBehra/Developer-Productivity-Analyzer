import axios from "axios";
import { useState } from "react";

const API_URL = "https://backend-henna-delta-87.vercel.app";

export default function Tracker({ onActivitySaved }) {
  const [type, setType] = useState("coding");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const activityIcons = {
    coding: "💻",
    browsing: "🌐",
    break: "☕",
    meeting: "👥",
    learning: "📚",
    youtube: "📺",
    instagram: "📸",
    reddit: "🔴"
  };

  const saveActivity = async () => {
    if (!duration || duration <= 0) {
      setMessage("⚠️ Please enter a valid duration");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      await axios.post(`${API_URL}/api/activity`, {
        type,
        duration: Number(duration)
      });
      setMessage("✅ Activity logged successfully!");
      setDuration("");
      if (onActivitySaved) onActivitySaved();
    } catch (error) {
      setMessage("❌ Failed to save activity. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracker-card">
      <h3>📝 Log Activity</h3>
      
      <div className="activity-buttons">
        {Object.keys(activityIcons).map(activity => (
          <button
            key={activity}
            className={`activity-btn ${type === activity ? 'active' : ''}`}
            onClick={() => setType(activity)}
          >
            {activityIcons[activity]} {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </button>
        ))}
      </div>

      <div className="input-group">
        <input
          type="number"
          placeholder="Duration in minutes"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          min="1"
          className="duration-input"
        />
        <button 
          onClick={saveActivity} 
          disabled={loading}
          className="save-btn"
        >
          {loading ? "Saving..." : "💾 Save Activity"}
        </button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
