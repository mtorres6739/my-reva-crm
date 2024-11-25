import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let contactsWhere = {};
    let tasksWhere = {};

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      contactsWhere.assignedToId = user.id;
      tasksWhere.assignedToId = user.id;
    }

    const [contacts, tasks, documents, events] = await Promise.all([
      prisma.contact.count({
        where: contactsWhere
      }),
      prisma.task.count({
        where: {
          ...tasksWhere,
          status: { not: 'COMPLETED' }
        }
      }),
      prisma.document.count({
        where: user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? {} : { uploadedById: user.id }
      }),
      prisma.event.count({
        where: {
          ...(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? {} : { createdById: user.id }),
          start: {
            gte: new Date()
          }
        }
      })
    ]);

    res.json({
      contacts,
      tasks,
      documents,
      events
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      where.userId = user.id;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

export default router;
