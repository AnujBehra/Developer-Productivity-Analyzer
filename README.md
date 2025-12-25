# 🚀 Developer Productivity Analyzer

A full-stack MERN application to track and visualize developer productivity activities.

![React](https://img.shields.io/badge/React-19.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-black)

## 🌐 Live Demo

- **Frontend:** [https://frontend-kohl-three-29.vercel.app](https://frontend-kohl-three-29.vercel.app)
- **Backend API:** [https://backend-henna-delta-87.vercel.app](https://backend-henna-delta-87.vercel.app)

## ✨ Features

- 📊 **Track Activities** - Log coding, browsing, and break time
- 📈 **Visual Dashboard** - View productivity breakdown with pie charts
- ☁️ **Cloud Storage** - Data persisted in MongoDB Atlas
- 🚀 **Deployed** - Fully deployed on Vercel

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Deployment | Vercel |

## 📁 Project Structure

```
Developer Productivity Analyzer/
├── backend/
│   ├── server.js          # Express server
│   ├── activity.js        # Mongoose Activity model
│   ├── activityroutes.js  # API routes
│   ├── package.json
│   └── vercel.json        # Vercel deployment config
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── tracker.js     # Activity logging component
│   │   └── dashboard.js   # Pie chart visualization
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/developer-productivity-analyzer.git
   cd developer-productivity-analyzer
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up MongoDB**
   - Create a MongoDB Atlas cluster
   - Update the connection string in `backend/server.js`

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

6. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | Get all activities |
| POST | `/api/activity` | Create new activity |

### Request Body (POST)
```json
{
  "type": "coding",
  "duration": 60
}
```

## 🚢 Deployment

Both frontend and backend are deployed on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && vercel --prod
```

## 📄 License

MIT License

## 👤 Author

**Anuj Behra**

---

Made with ❤️ for developer productivity
