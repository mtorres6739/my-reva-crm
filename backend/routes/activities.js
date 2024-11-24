const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const auth = require('../middleware/auth');

// Get all activities for the current user
router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);  // Limit to last 100 activities
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new activity
router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      userId: req.user.id
    });
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
