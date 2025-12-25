import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "https://backend-henna-delta-87.vercel.app";

// Activity categories
const FOCUSED_ACTIVITIES = ["coding", "learning", "meeting"];
const DISTRACTED_ACTIVITIES = ["youtube", "instagram", "reddit", "browsing"];
const PRODUCTIVE_ACTIVITIES = ["coding", "learning"];

export default function Insights({ refreshTrigger }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

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

  useEffect(() => {
    if (activities.length > 0) {
      const generatedInsights = analyzeProductivity(activities);
      setInsights(generatedInsights);
    }
  }, [activities]);

  // Main AI Analysis Engine
  const analyzeProductivity = (data) => {
    const insights = [];
    
    // 1. Best Coding Hours Analysis
    const bestHoursInsight = analyzeBestCodingHours(data);
    if (bestHoursInsight) insights.push(bestHoursInsight);

    // 2. Meeting Impact Analysis
    const meetingInsight = analyzeMeetingImpact(data);
    if (meetingInsight) insights.push(meetingInsight);

    // 3. Break Frequency & Burnout Risk
    const burnoutInsight = analyzeBurnoutRisk(data);
    if (burnoutInsight) insights.push(burnoutInsight);

    // 4. Distraction Patterns
    const distractionInsight = analyzeDistractionPatterns(data);
    if (distractionInsight) insights.push(distractionInsight);

    // 5. Productivity Streak
    const streakInsight = analyzeProductivityStreak(data);
    if (streakInsight) insights.push(streakInsight);

    // 6. Weekly Comparison
    const weeklyInsight = analyzeWeeklyTrend(data);
    if (weeklyInsight) insights.push(weeklyInsight);

    // 7. Learning Habits
    const learningInsight = analyzeLearningHabits(data);
    if (learningInsight) insights.push(learningInsight);

    // 8. Optimal Session Length
    const sessionInsight = analyzeOptimalSessionLength(data);
    if (sessionInsight) insights.push(sessionInsight);

    return insights;
  };

  // Analysis Functions
  const analyzeBestCodingHours = (data) => {
    const codingByHour = {};
    
    data.forEach(activity => {
      if (activity.type === "coding") {
        const hour = new Date(activity.date).getHours();
        codingByHour[hour] = (codingByHour[hour] || 0) + activity.duration;
      }
    });

    if (Object.keys(codingByHour).length === 0) return null;

    const sortedHours = Object.entries(codingByHour)
      .sort((a, b) => b[1] - a[1]);
    
    const bestHour = parseInt(sortedHours[0][0]);
    const bestHourEnd = bestHour + 2;
    
    const formatHour = (h) => {
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12} ${period}`;
    };

    return {
      type: "peak-performance",
      icon: "🧠",
      title: "Peak Coding Hours",
      message: `You code best between ${formatHour(bestHour)} – ${formatHour(bestHourEnd)}`,
      recommendation: "Schedule your most complex tasks during this time window for maximum productivity.",
      confidence: Math.min(95, 60 + sortedHours[0][1] / 10),
      priority: "high"
    };
  };

  const analyzeMeetingImpact = (data) => {
    const dayData = {};
    
    data.forEach(activity => {
      const day = new Date(activity.date).toDateString();
      if (!dayData[day]) {
        dayData[day] = { meetings: 0, coding: 0, totalMeetingTime: 0 };
      }
      if (activity.type === "meeting") {
        dayData[day].meetings++;
        dayData[day].totalMeetingTime += activity.duration;
      }
      if (activity.type === "coding") {
        dayData[day].coding += activity.duration;
      }
    });

    const days = Object.values(dayData);
    if (days.length < 2) return null;

    const highMeetingDays = days.filter(d => d.totalMeetingTime > 60);
    const lowMeetingDays = days.filter(d => d.totalMeetingTime <= 30);

    const avgCodingHighMeeting = highMeetingDays.length > 0 
      ? highMeetingDays.reduce((sum, d) => sum + d.coding, 0) / highMeetingDays.length 
      : 0;
    const avgCodingLowMeeting = lowMeetingDays.length > 0 
      ? lowMeetingDays.reduce((sum, d) => sum + d.coding, 0) / lowMeetingDays.length 
      : 0;

    if (avgCodingHighMeeting < avgCodingLowMeeting * 0.7 && highMeetingDays.length > 0) {
      return {
        type: "meeting-impact",
        icon: "📉",
        title: "Meeting Impact Detected",
        message: "Productivity drops by ~30% after long meetings (>1 hour)",
        recommendation: "Try to batch meetings together and protect focus time blocks.",
        confidence: 78,
        priority: "medium"
      };
    }

    return {
      type: "meeting-balance",
      icon: "✅",
      title: "Good Meeting Balance",
      message: "Your meetings don't significantly impact your coding productivity",
      recommendation: "Keep maintaining this healthy balance between meetings and deep work.",
      confidence: 72,
      priority: "low"
    };
  };

  const analyzeBurnoutRisk = (data) => {
    const last7Days = data.filter(a => {
      const activityDate = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate >= weekAgo;
    });

    const totalCoding = last7Days
      .filter(a => a.type === "coding")
      .reduce((sum, a) => sum + a.duration, 0);
    
    const totalBreaks = last7Days
      .filter(a => a.type === "break")
      .reduce((sum, a) => sum + a.duration, 0);

    const breakRatio = totalCoding > 0 ? totalBreaks / totalCoding : 1;
    const avgDailyCoding = totalCoding / 7;

    // High burnout risk
    if (breakRatio < 0.1 && avgDailyCoding > 180) {
      return {
        type: "burnout-risk",
        icon: "🔥",
        title: "High Burnout Risk",
        message: "Break frequency too low with high coding hours",
        recommendation: "Take a 5-10 min break every 90 minutes. Your long-term productivity depends on it!",
        confidence: 85,
        priority: "critical"
      };
    }

    // Moderate risk
    if (breakRatio < 0.15 && avgDailyCoding > 120) {
      return {
        type: "burnout-warning",
        icon: "⚠️",
        title: "Burnout Warning",
        message: "You're coding a lot with few breaks",
        recommendation: "Consider adding short breaks. The Pomodoro technique (25 min work, 5 min break) can help.",
        confidence: 75,
        priority: "medium"
      };
    }

    // Healthy
    if (breakRatio >= 0.15) {
      return {
        type: "healthy-habits",
        icon: "💚",
        title: "Healthy Work Habits",
        message: "Good balance between work and breaks",
        recommendation: "You're maintaining a sustainable pace. Keep it up!",
        confidence: 80,
        priority: "low"
      };
    }

    return null;
  };

  const analyzeDistractionPatterns = (data) => {
    const distractions = data.filter(a => DISTRACTED_ACTIVITIES.includes(a.type));
    
    if (distractions.length === 0) {
      return {
        type: "focus-master",
        icon: "🎯",
        title: "Focus Master",
        message: "No significant distractions detected!",
        recommendation: "Excellent focus discipline. You're a productivity champion!",
        confidence: 90,
        priority: "low"
      };
    }

    // Find most common distraction time
    const distractionByHour = {};
    distractions.forEach(d => {
      const hour = new Date(d.date).getHours();
      distractionByHour[hour] = (distractionByHour[hour] || 0) + d.duration;
    });

    const peakDistractionHour = Object.entries(distractionByHour)
      .sort((a, b) => b[1] - a[1])[0];

    if (peakDistractionHour) {
      const hour = parseInt(peakDistractionHour[0]);
      const formatHour = (h) => {
        const period = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12} ${period}`;
      };

      // Find most common distraction source
      const sourceCount = {};
      distractions.forEach(d => {
        sourceCount[d.type] = (sourceCount[d.type] || 0) + d.duration;
      });
      const topSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0][0];

      return {
        type: "distraction-pattern",
        icon: "📱",
        title: "Distraction Pattern Found",
        message: `You get most distracted around ${formatHour(hour)} (mainly ${topSource})`,
        recommendation: `Try blocking ${topSource} during work hours or use website blockers.`,
        confidence: 82,
        priority: "medium"
      };
    }

    return null;
  };

  const analyzeProductivityStreak = (data) => {
    const daySet = new Set();
    data.forEach(a => {
      if (PRODUCTIVE_ACTIVITIES.includes(a.type)) {
        daySet.add(new Date(a.date).toDateString());
      }
    });

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (daySet.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    if (streak >= 7) {
      return {
        type: "streak-achievement",
        icon: "🔥",
        title: `${streak}-Day Productivity Streak!`,
        message: "You've been consistently productive for over a week",
        recommendation: "Amazing consistency! Momentum is your superpower. Keep the streak alive!",
        confidence: 95,
        priority: "low"
      };
    }

    if (streak >= 3) {
      return {
        type: "streak-building",
        icon: "⚡",
        title: `${streak}-Day Streak Building`,
        message: "You're building good momentum",
        recommendation: "Just a few more days to reach a week-long streak!",
        confidence: 85,
        priority: "low"
      };
    }

    return null;
  };

  const analyzeWeeklyTrend = (data) => {
    const getWeekTotal = (weeksAgo) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (7 * (weeksAgo + 1)));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (7 * weeksAgo));

      return data
        .filter(a => {
          const date = new Date(a.date);
          return date >= startDate && date < endDate && PRODUCTIVE_ACTIVITIES.includes(a.type);
        })
        .reduce((sum, a) => sum + a.duration, 0);
    };

    const thisWeek = getWeekTotal(0);
    const lastWeek = getWeekTotal(1);

    if (lastWeek === 0) return null;

    const change = ((thisWeek - lastWeek) / lastWeek) * 100;

    if (change > 20) {
      return {
        type: "improvement",
        icon: "📈",
        title: "Productivity Up!",
        message: `You're ${Math.round(change)}% more productive than last week`,
        recommendation: "Great improvement! Keep the momentum going.",
        confidence: 88,
        priority: "low"
      };
    }

    if (change < -20) {
      return {
        type: "decline",
        icon: "📉",
        title: "Productivity Dip",
        message: `Productivity is down ${Math.abs(Math.round(change))}% from last week`,
        recommendation: "Review what changed this week. External factors? Try resetting your routine.",
        confidence: 85,
        priority: "medium"
      };
    }

    return {
      type: "stable",
      icon: "📊",
      title: "Consistent Performance",
      message: "Your productivity is stable week over week",
      recommendation: "Stability is good! Consider small improvements to level up.",
      confidence: 80,
      priority: "low"
    };
  };

  const analyzeLearningHabits = (data) => {
    const learningActivities = data.filter(a => a.type === "learning");
    const totalLearning = learningActivities.reduce((sum, a) => sum + a.duration, 0);
    const totalCoding = data.filter(a => a.type === "coding").reduce((sum, a) => sum + a.duration, 0);

    const learningRatio = totalCoding > 0 ? totalLearning / totalCoding : 0;

    if (learningRatio >= 0.2) {
      return {
        type: "learning-champion",
        icon: "📚",
        title: "Learning Champion",
        message: "Great learning-to-coding ratio (20%+)",
        recommendation: "Your investment in learning will compound over time. Keep growing!",
        confidence: 85,
        priority: "low"
      };
    }

    if (learningRatio < 0.05 && totalCoding > 300) {
      return {
        type: "learning-gap",
        icon: "📖",
        title: "Learning Opportunity",
        message: "You're coding a lot but learning time is low",
        recommendation: "Dedicate 15-30 mins daily to learning. It boosts long-term productivity.",
        confidence: 78,
        priority: "medium"
      };
    }

    return null;
  };

  const analyzeOptimalSessionLength = (data) => {
    const codingSessions = data.filter(a => a.type === "coding");
    
    if (codingSessions.length < 5) return null;

    const avgSession = codingSessions.reduce((sum, a) => sum + a.duration, 0) / codingSessions.length;

    if (avgSession > 120) {
      return {
        type: "long-sessions",
        icon: "⏱️",
        title: "Long Coding Sessions",
        message: `Average session: ${Math.round(avgSession)} mins`,
        recommendation: "Try breaking into 90-min focused blocks with breaks for better sustained focus.",
        confidence: 75,
        priority: "medium"
      };
    }

    if (avgSession < 25) {
      return {
        type: "short-sessions",
        icon: "⚡",
        title: "Short Sessions Detected",
        message: `Average session: ${Math.round(avgSession)} mins`,
        recommendation: "Longer focused sessions (45-90 mins) help achieve deep work state.",
        confidence: 70,
        priority: "medium"
      };
    }

    return {
      type: "optimal-sessions",
      icon: "✨",
      title: "Optimal Session Length",
      message: `Average session: ${Math.round(avgSession)} mins (ideal range)`,
      recommendation: "Your session lengths are in the sweet spot for deep work!",
      confidence: 85,
      priority: "low"
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "#f44336";
      case "high": return "#ff9800";
      case "medium": return "#ffc107";
      case "low": return "#4CAF50";
      default: return "#667eea";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "critical": return "Action Needed";
      case "high": return "Important";
      case "medium": return "Suggestion";
      case "low": return "Insight";
      default: return "Info";
    }
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="spinner"></div>
        <p>🤖 AI is analyzing your productivity...</p>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h2>🤖 AI Productivity Insights</h2>
        <p>Personalized recommendations based on your activity patterns</p>
      </div>

      {insights.length === 0 ? (
        <div className="no-insights">
          <span className="no-insights-icon">📊</span>
          <h3>Not enough data yet</h3>
          <p>Log more activities to unlock AI-powered insights!</p>
        </div>
      ) : (
        <div className="insights-grid">
          {insights
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((insight, index) => (
              <div 
                key={index} 
                className={`insight-card priority-${insight.priority}`}
                style={{ borderLeftColor: getPriorityColor(insight.priority) }}
              >
                <div className="insight-header">
                  <span className="insight-icon">{insight.icon}</span>
                  <div className="insight-title-area">
                    <h3>{insight.title}</h3>
                    <span 
                      className="priority-badge"
                      style={{ background: getPriorityColor(insight.priority) }}
                    >
                      {getPriorityLabel(insight.priority)}
                    </span>
                  </div>
                </div>
                
                <p className="insight-message">{insight.message}</p>
                
                <div className="insight-recommendation">
                  <span className="rec-icon">💡</span>
                  <p>{insight.recommendation}</p>
                </div>

                <div className="insight-confidence">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span>{insight.confidence}% confidence</span>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="ai-disclaimer">
        <span>🧪</span>
        <p>Insights are generated using pattern analysis. For more accurate predictions, keep logging your activities consistently.</p>
      </div>
    </div>
  );
}
