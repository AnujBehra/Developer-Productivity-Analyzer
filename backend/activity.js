const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    type: String, // coding | browsing | break
    duration: Number, // in minutes
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Activity", ActivitySchema);
