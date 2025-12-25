const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const activityRoutes = require("./activityroutes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://behraanuj_db_user:EvT2xhRIOu0iv7cf@cluster0.a1gppft.mongodb.net/productivity?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/activity", activityRoutes);

// For local development
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;