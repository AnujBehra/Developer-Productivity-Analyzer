import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const API_URL = "https://backend-henna-delta-87.vercel.app";

// Define focused vs distracted activities
const FOCUSED_ACTIVITIES = ["coding", "learning", "meeting"];
const DISTRACTED_ACTIVITIES = ["youtube", "instagram", "reddit", "browsing"];

export default function Focus({ refreshTrigger }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("daily"); // daily or weekly

  const fetchActivities = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activity`);
      setActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, refreshTrigger]);

  // Calculate focus score (0-100)
  const calculateFocusScore = (activityList) => {
    if (activityList.length === 0) return 0;
    
    let focusedTime = 0;
    let distractedTime = 0;
    
    activityList.forEach(activity => {
      if (FOCUSED_ACTIVITIES.includes(activity.type)) {
        focusedTime += activity.duration;
      } else if (DISTRACTED_ACTIVITIES.includes(activity.type)) {
        distractedTime += activity.duration;
      }
    });
    
    const totalTime = focusedTime + distractedTime;
    if (totalTime === 0) return 100;
    
    return Math.round((focusedTime / totalTime) * 100);
  };

  // Get today's activities
  const getTodayActivities = () => {
    const today = new Date().toDateString();
    return activities.filter(a => new Date(a.date).toDateString() === today);
  };

  // Get activities for last 7 days
  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayActivities = activities.filter(a => new Date(a.date).toDateString() === dateStr);
      
      let focusedTime = 0;
      let distractedTime = 0;
      
      dayActivities.forEach(activity => {
        if (FOCUSED_ACTIVITIES.includes(activity.type)) {
          focusedTime += activity.duration;
        } else if (DISTRACTED_ACTIVITIES.includes(activity.type)) {
          distractedTime += activity.duration;
        }
      });

      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        focusScore: calculateFocusScore(dayActivities),
        focusedTime,
        distractedTime
      });
    }
    return days;
  };

  // Get daily breakdown (last 24 hours in 4-hour blocks)
  const getDailyData = () => {
    const today = new Date();
    const todayActivities = getTodayActivities();
    
    // Group by hours (simplified - just show hourly focus)
    const hours = [];
    for (let i = 0; i < 24; i += 4) {
      const hourActivities = todayActivities.filter(a => {
        const hour = new Date(a.date).getHours();
        return hour >= i && hour < i + 4;
      });
      
      hours.push({
        time: `${i}:00`,
        focusScore: calculateFocusScore(hourActivities),
        activities: hourActivities.length
      });
    }
    return hours;
  };

  // Calculate distraction breakdown
  const getDistractionBreakdown = () => {
    const todayActivities = getTodayActivities();
    const breakdown = {};
    
    DISTRACTED_ACTIVITIES.forEach(type => {
      breakdown[type] = todayActivities
        .filter(a => a.type === type)
        .reduce((sum, a) => sum + a.duration, 0);
    });
    
    return breakdown;
  };

  const todayScore = calculateFocusScore(getTodayActivities());
  const weeklyData = getWeeklyData();
  const dailyData = getDailyData();
  const distractionBreakdown = getDistractionBreakdown();
  
  // Calculate weekly average
  const weeklyAverage = Math.round(
    weeklyData.reduce((sum, d) => sum + d.focusScore, 0) / weeklyData.length
  );

  // Get score color and emoji
  const getScoreStyle = (score) => {
    if (score >= 80) return { color: "#4CAF50", emoji: "🔥", label: "Excellent!" };
    if (score >= 60) return { color: "#8BC34A", emoji: "👍", label: "Good" };
    if (score >= 40) return { color: "#FFC107", emoji: "😐", label: "Average" };
    if (score >= 20) return { color: "#FF9800", emoji: "⚠️", label: "Low" };
    return { color: "#f44336", emoji: "😴", label: "Distracted" };
  };

  const todayStyle = getScoreStyle(todayScore);

  const distractionIcons = {
    youtube: "📺",
    instagram: "📸",
    reddit: "🔴",
    browsing: "🌐"
  };

  if (loading) {
    return (
      <div className="focus-loading">
        <div className="spinner"></div>
        <p>Analyzing your focus...</p>
      </div>
    );
  }

  return (
    <div className="focus-container">
      {/* Focus Score Card */}
      <div className="focus-score-card">
        <h3>🎯 Today's Focus Score</h3>
        <div className="score-display">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${todayStyle.color} ${todayScore}%, #252540 0%)` 
            }}
          >
            <div className="score-inner">
              <span className="score-value">{todayScore}</span>
              <span className="score-emoji">{todayStyle.emoji}</span>
            </div>
          </div>
          <div className="score-info">
            <span className="score-label" style={{ color: todayStyle.color }}>
              {todayStyle.label}
            </span>
            <span className="score-subtitle">
              {todayScore >= 60 ? "Keep it up!" : "Try to minimize distractions"}
            </span>
          </div>
        </div>
      </div>

      {/* Focus Stats */}
      <div className="focus-stats">
        <div className="focus-stat">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{weeklyAverage}%</span>
          <span className="stat-label">Weekly Avg</span>
        </div>
        <div className="focus-stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">
            {getTodayActivities()
              .filter(a => FOCUSED_ACTIVITIES.includes(a.type))
              .reduce((sum, a) => sum + a.duration, 0)}m
          </span>
          <span className="stat-label">Focused Today</span>
        </div>
        <div className="focus-stat">
          <span className="stat-icon">📵</span>
          <span className="stat-value">
            {getTodayActivities()
              .filter(a => DISTRACTED_ACTIVITIES.includes(a.type))
              .reduce((sum, a) => sum + a.duration, 0)}m
          </span>
          <span className="stat-label">Distracted Today</span>
        </div>
      </div>

      {/* Distraction Sources */}
      <div className="distraction-card">
        <h3>🚫 Distraction Sources</h3>
        <div className="distraction-list">
          {Object.entries(distractionBreakdown).map(([type, duration]) => (
            <div key={type} className="distraction-item">
              <span className="distraction-icon">{distractionIcons[type]}</span>
              <span className="distraction-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <div className="distraction-bar-container">
                <div 
                  className="distraction-bar"
                  style={{ 
                    width: `${Math.min(duration * 2, 100)}%`,
                    background: duration > 30 ? "#f44336" : duration > 15 ? "#FF9800" : "#4CAF50"
                  }}
                />
              </div>
              <span className="distraction-duration">{duration}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="focus-trend-card">
        <div className="trend-header">
          <h3>📈 Focus Trend</h3>
          <div className="view-toggle">
            <button 
              className={view === "daily" ? "active" : ""}
              onClick={() => setView("daily")}
            >
              Daily
            </button>
            <button 
              className={view === "weekly" ? "active" : ""}
              onClick={() => setView("weekly")}
            >
              Weekly
            </button>
          </div>
        </div>
        
        <div className="trend-chart">
          <ResponsiveContainer width="100%" height={250}>
            {view === "weekly" ? (
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis domain={[0, 100]} stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    background: "#1a1a2e", 
                    border: "1px solid #333",
                    borderRadius: "10px"
                  }}
                  formatter={(value) => [`${value}%`, "Focus Score"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="focusScore" 
                  stroke="#667eea" 
                  fill="url(#focusGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            ) : (
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis domain={[0, 100]} stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    background: "#1a1a2e", 
                    border: "1px solid #333",
                    borderRadius: "10px"
                  }}
                  formatter={(value) => [`${value}%`, "Focus Score"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="focusScore" 
                  stroke="#764ba2" 
                  strokeWidth={3}
                  dot={{ fill: "#764ba2", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="weekly-summary-card">
        <h3>📅 This Week</h3>
        <div className="week-days">
          {weeklyData.map((day, index) => (
            <div key={index} className="week-day">
              <span className="day-name">{day.day}</span>
              <div 
                className="day-score-bar"
                style={{ 
                  height: `${day.focusScore}%`,
                  background: getScoreStyle(day.focusScore).color
                }}
              />
              <span className="day-score">{day.focusScore}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
