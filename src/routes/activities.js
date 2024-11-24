import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get all activities for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 activities
    });

    console.log('Raw activities from DB:', activities);

    // Parse the taskData JSON string back into an object
    const parsedActivities = activities.map(activity => {
      let taskData = null;
      if (activity.taskData) {
        try {
          taskData = JSON.parse(activity.taskData);
        } catch (e) {
          console.error('Error parsing taskData for activity:', activity.id, e);
        }
      }
      return {
        ...activity,
        taskData
      };
    });

    console.log('Sending parsed activities:', parsedActivities);
    res.json(parsedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Create a new activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, taskTitle, taskData, timestamp } = req.body;
    console.log('Creating activity with data:', { type, taskTitle, taskData, timestamp });
    
    // Convert taskData to string if it's an object
    const taskDataString = taskData ? JSON.stringify(taskData) : null;
    console.log('Stringified taskData:', taskDataString);
    
    // Create the activity with taskData stored as JSON string
    const activity = await prisma.activity.create({
      data: {
        type,
        taskTitle,
        taskData: taskDataString,
        timestamp: timestamp || new Date(),
        userId: req.user.id,
      },
    });
    
    console.log('Created activity in DB:', activity);
    
    // Parse the taskData back to an object before sending the response
    const responseActivity = {
      ...activity,
      taskData: taskData // Use the original taskData object
    };
    
    console.log('Sending response activity:', responseActivity);
    res.status(201).json(responseActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).json({ message: 'Error creating activity' });
  }
});

export default router;
