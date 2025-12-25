import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "https://backend-henna-delta-87.vercel.app";

const BADGES = [
  { id: "first_step", name: "First Step", icon: "🎯", description: "Log your first activity", requirement: (stats) => stats.totalActivities >= 1 },
  { id: "productive_hour", name: "Productive Hour", icon: "⏰", description: "Log 60 minutes of coding", requirement: (stats) => stats.codingMinutes >= 60 },
  { id: "coding_master", name: "Coding Master", icon: "💻", description: "Log 5 hours of coding", requirement: (stats) => stats.codingMinutes >= 300 },
  { id: "balanced", name: "Work-Life Balance", icon: "⚖️", description: "Take at least 30 mins of breaks", requirement: (stats) => stats.breakMinutes >= 30 },
  { id: "learner", name: "Lifelong Learner", icon: "📚", description: "Spend 2 hours learning", requirement: (stats) => stats.learningMinutes >= 120 },
  { id: "dedicated", name: "Dedicated Dev", icon: "🔥", description: "Log 10+ activities", requirement: (stats) => stats.totalActivities >= 10 },
  { id: "marathon", name: "Marathon Coder", icon: "🏃", description: "Log 10 hours total", requirement: (stats) => stats.totalMinutes >= 600 },
  { id: "focus_king", name: "Focus King", icon: "👑", description: "80%+ coding ratio", requirement: (stats) => stats.totalMinutes > 0 && (stats.codingMinutes / stats.totalMinutes) >= 0.8 },
];

const LEVELS = [
  { level: 1, name: "Beginner", minPoints: 0, icon: "🌱" },
  { level: 2, name: "Apprentice", minPoints: 100, icon: "🌿" },
  { level: 3, name: "Developer", minPoints: 300, icon: "🌳" },
  { level: 4, name: "Senior Dev", minPoints: 600, icon: "🚀" },
  { level: 5, name: "Tech Lead", minPoints: 1000, icon: "⭐" },
  { level: 6, name: "Architect", minPoints: 1500, icon: "🏆" },
  { level: 7, name: "Legend", minPoints: 2500, icon: "👑" },
];

export default function Rewards({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalMinutes: 0,
    codingMinutes: 0,
    breakMinutes: 0,
    learningMinutes: 0,
    browsingMinutes: 0,
    meetingMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/activity`);
      const activities = res.data;

      const newStats = {
        totalActivities: activities.length,
        totalMinutes: 0,
        codingMinutes: 0,
        breakMinutes: 0,
        learningMinutes: 0,
        browsingMinutes: 0,
        meetingMinutes: 0,
      };

      activities.forEach((a) => {
        const duration = Number(a.duration) || 0;
        newStats.totalMinutes += duration;
        
        switch (a.type) {
          case "coding":
            newStats.codingMinutes += duration;
            break;
          case "break":
            newStats.breakMinutes += duration;
            break;
          case "learning":
            newStats.learningMinutes += duration;
            break;
          case "browsing":
            newStats.browsingMinutes += duration;
            break;
          case "meeting":
            newStats.meetingMinutes += duration;
            break;
          default:
            break;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  // Calculate points
  const calculatePoints = () => {
    let points = 0;
    points += stats.codingMinutes * 2; // 2 points per coding minute
    points += stats.learningMinutes * 1.5; // 1.5 points per learning minute
    points += stats.meetingMinutes * 1; // 1 point per meeting minute
    points += stats.breakMinutes * 0.5; // 0.5 points per break (encourage balance)
    points += stats.browsingMinutes * 0.25; // 0.25 points per browsing
    
    // Bonus for badges
    const earnedBadges = BADGES.filter(b => b.requirement(stats));
    points += earnedBadges.length * 50; // 50 bonus points per badge
    
    return Math.floor(points);
  };

  const points = calculatePoints();
  
  // Get current level
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel 
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const earnedBadges = BADGES.filter(b => b.requirement(stats));
  const lockedBadges = BADGES.filter(b => !b.requirement(stats));

  // Calculate productivity score (0-100)
  const productivityScore = stats.totalMinutes > 0
    ? Math.min(100, Math.round(((stats.codingMinutes + stats.learningMinutes) / stats.totalMinutes) * 100))
    : 0;

  if (loading) {
    return (
      <div className="rewards-card">
        <h3>🏆 Rewards & Achievements</h3>
        <div className="loading">⏳ Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="rewards-card">
      <h3>🏆 Rewards & Achievements</h3>

      {/* Level & Points */}
      <div className="level-section">
        <div className="current-level">
          <span className="level-icon">{currentLevel.icon}</span>
          <div className="level-info">
            <span className="level-name">Level {currentLevel.level}: {currentLevel.name}</span>
            <span className="points-display">⭐ {points} points</span>
          </div>
        </div>
        
        {nextLevel && (
          <div className="level-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressToNext}%` }}></div>
            </div>
            <span className="next-level-text">
              {nextLevel.minPoints - points} pts to {nextLevel.icon} {nextLevel.name}
            </span>
          </div>
        )}
      </div>

      {/* Productivity Score */}
      <div className="score-section">
        <div className="score-circle" style={{ 
          background: `conic-gradient(${productivityScore >= 70 ? '#4CAF50' : productivityScore >= 40 ? '#FF9800' : '#f44336'} ${productivityScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
        }}>
          <div className="score-inner">
            <span className="score-value">{productivityScore}</span>
            <span className="score-label">Score</span>
          </div>
        </div>
        <div className="score-info">
          <h4>Productivity Score</h4>
          <p>Based on coding & learning vs total time</p>
          <p className="score-tip">
            {productivityScore >= 70 ? "🔥 Excellent! Keep it up!" : 
             productivityScore >= 40 ? "👍 Good progress!" : 
             "💪 Let's focus more on coding!"}
          </p>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="badges-section">
          <h4>🎖️ Earned Badges ({earnedBadges.length}/{BADGES.length})</h4>
          <div className="badges-grid">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="badge earned">
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-desc">{badge.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="badges-section">
          <h4>🔒 Badges to Unlock</h4>
          <div className="badges-grid">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="badge locked">
                <span className="badge-icon">🔒</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-desc">{badge.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat">
          <span className="stat-icon">💻</span>
          <span className="stat-value">{Math.floor(stats.codingMinutes / 60)}h {stats.codingMinutes % 60}m</span>
          <span className="stat-label">Coding</span>
        </div>
        <div className="stat">
          <span className="stat-icon">📚</span>
          <span className="stat-value">{Math.floor(stats.learningMinutes / 60)}h {stats.learningMinutes % 60}m</span>
          <span className="stat-label">Learning</span>
        </div>
        <div className="stat">
          <span className="stat-icon">☕</span>
          <span className="stat-value">{Math.floor(stats.breakMinutes / 60)}h {stats.breakMinutes % 60}m</span>
          <span className="stat-label">Breaks</span>
        </div>
      </div>
    </div>
  );
}
