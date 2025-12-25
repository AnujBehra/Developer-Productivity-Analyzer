const express = require("express");
const Activity = require("./activity");

const router = express.Router();

// Add activity
router.post("/", async (req, res) => {
    try {
        const activity = new Activity({
            type: req.body.type,
            duration: Number(req.body.duration)
        });
        await activity.save();
        res.json(activity);
    } catch (error) {
        console.error("Error saving activity:", error);
        res.status(500).json({ error: "Failed to save activity" });
    }
});

// Get all activities
router.get("/", async (req, res) => {
    try {
        const data = await Activity.find().sort({ date: -1 }).limit(100);
        res.json(data);
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});

module.exports = router;
