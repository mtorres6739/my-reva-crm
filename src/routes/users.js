import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user hierarchy based on user role
router.get('/hierarchy', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;

    let users = [];
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        // Super admin can see all users
        users = await prisma.user.findMany({
          include: {
            supervisor: true,
            subordinates: true,
          },
        });
        break;

      case 'ADMIN':
        // Admin can see their subordinates and their subordinates' subordinates
        users = await prisma.user.findMany({
          where: {
            OR: [
              { supervisorId: currentUser.id },
              {
                supervisor: {
                  supervisorId: currentUser.id,
                },
              },
            ],
          },
          include: {
            supervisor: true,
            subordinates: true,
          },
        });
        // Add the admin themselves to the list
        const admin = await prisma.user.findUnique({
          where: { id: currentUser.id },
          include: {
            supervisor: true,
            subordinates: true,
          },
        });
        users.unshift(admin);
        break;

      case 'BROKER':
        // Broker can see only their direct subordinates
        users = await prisma.user.findMany({
          where: {
            supervisorId: currentUser.id,
          },
          include: {
            supervisor: true,
            subordinates: true,
          },
        });
        // Add the broker themselves to the list
        const broker = await prisma.user.findUnique({
          where: { id: currentUser.id },
          include: {
            supervisor: true,
            subordinates: true,
          },
        });
        users.unshift(broker);
        break;

      case 'AGENT':
        // Agents can only see themselves
        users = [await prisma.user.findUnique({
          where: { id: currentUser.id },
          include: {
            supervisor: true,
            subordinates: true,
          },
        })];
        break;

      default:
        return res.status(403).json({ error: 'Invalid user role' });
    }

    // Remove sensitive information
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      supervisor: user.supervisor ? {
        id: user.supervisor.id,
        name: user.supervisor.name,
        role: user.supervisor.role,
      } : null,
      subordinates: user.subordinates ? user.subordinates.map(sub => ({
        id: sub.id,
        name: sub.name,
        role: sub.role,
      })) : [],
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching user hierarchy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const currentUser = req.user;

    // Check if the user has permission to view this user's details
    let hasPermission = false;
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        hasPermission = true;
        break;
      case 'ADMIN':
        // Admin can view their own details and their subordinates' details
        if (userId === currentUser.id) {
          hasPermission = true;
        } else {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { supervisor: true }
          });
          hasPermission = user?.supervisorId === currentUser.id || user?.supervisor?.supervisorId === currentUser.id;
        }
        break;
      case 'BROKER':
        // Broker can view their own details and their direct subordinates' details
        if (userId === currentUser.id) {
          hasPermission = true;
        } else {
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });
          hasPermission = user?.supervisorId === currentUser.id;
        }
        break;
      case 'AGENT':
        // Agent can only view their own details
        hasPermission = userId === currentUser.id;
        break;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to view this user\'s details' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        supervisor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
