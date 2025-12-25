const express = require("express");
const Activity = require("./activity");

const router = express.Router();

// Add activity
router.post("/", async (req, res) => {
    const activity = new Activity(req.body);
    await activity.save();
    res.json(activity);
});

// Get all activities
router.get("/", async (req, res) => {
    const data = await Activity.find();
    res.json(data);
});

module.exports = router;
