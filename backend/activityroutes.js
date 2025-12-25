const express = require("express");
const Activity = require("./activity");

const router = express.Router();

// Add activity
router.post("/", async (req, res) => {
    try {
        const activity = new Activity({
            type: req.body.type,
            duration: Number(req.body.duration),
            note: req.body.note || ""
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

// Get today's activities
router.get("/today", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const data = await Activity.find({
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });
        res.json(data);
    } catch (error) {
        console.error("Error fetching today's activities:", error);
        res.status(500).json({ error: "Failed to fetch today's activities" });
    }
});

// Get weekly stats
router.get("/stats/weekly", async (req, res) => {
    try {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const data = await Activity.aggregate([
            { $match: { date: { $gte: weekAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        type: "$type"
                    },
                    totalDuration: { $sum: "$duration" }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);
        res.json(data);
    } catch (error) {
        console.error("Error fetching weekly stats:", error);
        res.status(500).json({ error: "Failed to fetch weekly stats" });
    }
});

// Delete activity
router.delete("/:id", async (req, res) => {
    try {
        const result = await Activity.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Activity not found" });
        }
        res.json({ message: "Activity deleted", id: req.params.id });
    } catch (error) {
        console.error("Error deleting activity:", error);
        res.status(500).json({ error: "Failed to delete activity" });
    }
});

// Clear all activities (for testing)
router.delete("/", async (req, res) => {
    try {
        await Activity.deleteMany({});
        res.json({ message: "All activities deleted" });
    } catch (error) {
        console.error("Error clearing activities:", error);
        res.status(500).json({ error: "Failed to clear activities" });
    }
});

module.exports = router;
