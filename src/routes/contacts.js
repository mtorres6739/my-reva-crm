import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { assignedToId: req.user.id },
          {
            assignedTo: {
              supervisorId: req.user.id
            }
          }
        ]
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        policies: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Error fetching contacts' });
  }
});

// Get contact by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        policies: true
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if user has access to this contact
    const hasAccess = contact.assignedToId === req.user.id || 
                     contact.assignedTo?.supervisorId === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this contact' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Error fetching contact' });
  }
});

// Create new contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      address,
      notes,
      status
    } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        address,
        notes,
        status: status || 'ACTIVE',
        assignedToId: req.user.id
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Error creating contact' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone,
      address,
      notes,
      status
    } = req.body;

    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        address,
        notes,
        status
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Error updating contact' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if user has access to delete this contact
    const hasAccess = contact.assignedToId === req.user.id || 
                     contact.assignedTo?.supervisorId === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to delete this contact' });
    }

    await prisma.contact.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Error deleting contact' });
  }
});

export default router;
