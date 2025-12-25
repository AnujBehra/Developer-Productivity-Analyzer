const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    type: String, // coding | browsing | break | meeting | learning
    duration: Number, // in minutes
    note: { type: String, default: "" }, // optional note
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Activity", ActivitySchema);
