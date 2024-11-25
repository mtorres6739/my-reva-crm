import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all policies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.query;
    
    const whereClause = {
      OR: [
        {
          contact: {
            assignedToId: req.user.id
          }
        },
        {
          contact: {
            assignedTo: {
              supervisorId: req.user.id
            }
          }
        }
      ]
    };

    // Add contactId filter if provided
    if (contactId) {
      whereClause.contactId = parseInt(contactId);
    }

    const policies = await prisma.policy.findMany({
      where: whereClause,
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ 
      error: 'Error fetching policies',
      details: error.message 
    });
  }
});

// Get policy by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await prisma.policy.findUnique({
      where: { id: parseInt(id) },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Check if user has access to this policy
    const hasAccess = policy.contact.assignedToId === req.user.id || 
                     policy.contact.assignedTo?.supervisorId === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this policy' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ 
      error: 'Error fetching policy',
      details: error.message 
    });
  }
});

// Create new policy
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      contactId, 
      policyNumber, 
      type, 
      carrier,
      effectiveDate,
      expiryDate,
      monthlyPremium,
      annualPremium,
      status,
      details,
      notes 
    } = req.body;

    const policy = await prisma.policy.create({
      data: {
        contact: { connect: { id: parseInt(contactId) } },
        policyNumber,
        type,
        carrier,
        effectiveDate: new Date(effectiveDate),
        expiryDate: new Date(expiryDate),
        monthlyPremium: parseFloat(monthlyPremium),
        annualPremium: parseFloat(annualPremium),
        status: status || 'ACTIVE',
        details: details || {},
        notes
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ 
      error: 'Error creating policy',
      details: error.message 
    });
  }
});

// Update policy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      policyNumber, 
      type, 
      carrier,
      effectiveDate,
      expiryDate,
      monthlyPremium,
      annualPremium,
      status,
      details,
      notes 
    } = req.body;

    const policy = await prisma.policy.update({
      where: { id: parseInt(id) },
      data: {
        policyNumber,
        type,
        carrier,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        monthlyPremium: monthlyPremium ? parseFloat(monthlyPremium) : undefined,
        annualPremium: annualPremium ? parseFloat(annualPremium) : undefined,
        status,
        details,
        notes
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ 
      error: 'Error updating policy',
      details: error.message 
    });
  }
});

// Delete policy
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await prisma.policy.findUnique({
      where: { id: parseInt(id) },
      include: {
        contact: true
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Check if user has access to delete this policy
    const hasAccess = policy.contact.assignedToId === req.user.id || 
                     policy.contact.assignedTo?.supervisorId === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to delete this policy' });
    }

    await prisma.policy.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ 
      error: 'Error deleting policy',
      details: error.message 
    });
  }
});

export default router;
