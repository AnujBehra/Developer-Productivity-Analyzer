const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const activityRoutes = require("./activityroutes");

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://behraanuj_db_user:EvT2xhRIOu0iv7cf@cluster0.a1gppft.mongodb.net/productivity?retryWrites=true&w=majority";

// Cached connection for serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Developer Productivity API" });
});

app.use("/api/activity", activityRoutes);

// For local development
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;