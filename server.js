import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { prisma } from './src/lib/db.js';
import usersRouter from './src/routes/users.js';
import authRouter from './src/routes/auth.js';
import activitiesRouter from './src/routes/activities.js';
import { authenticateToken } from './src/middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to accept credentials and the Authorization header
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/activities', activitiesRouter);

// Get all contacts for the current user
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/contacts');
    console.log('User:', req.user);

    let contacts;
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      console.log('Fetching all contacts for admin');
      contacts = await prisma.contact.findMany({
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          policies: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } else {
      console.log('Fetching contacts for user:', req.user.id);
      contacts = await prisma.contact.findMany({
        where: {
          assignedToId: req.user.id,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          policies: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    console.log('Found contacts:', JSON.stringify(contacts, null, 2));
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single contact by ID
app.get('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedTo: true,
        policies: true,
        tasks: true,
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if user has permission to view this contact
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
      if (contact.assignedToId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view this contact' });
      }
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new contact
app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, workplace, birthdate, status, notes } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Create contact with validated data
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        address,
        workplace,
        birthdate: birthdate ? new Date(birthdate) : null,
        status,
        notes,
        assignedToId: req.user.id
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'A contact with this email already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create contact: ' + error.message });
    }
  }
});

// Get all users (for assigning contacts)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Only return agents and brokers for contact assignment
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['AGENT', 'BROKER']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact notes
app.put('/api/contacts/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Verify the contact exists and user has permission
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
      include: { assignedTo: true }
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if user has permission to update this contact
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
      if (contact.assignedToId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this contact' });
      }
    }

    // Update the contact's notes
    const updatedContact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { notes }
    });

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact notes:', error);
    res.status(500).json({ message: 'Failed to update notes' });
  }
});

// Seed endpoint
app.post('/api/seed', authenticateToken, async (req, res) => {
  try {
    const testContacts = [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "555-0101",
        address: "123 Main St, Anytown, USA",
        birthdate: new Date("1985-03-15"),
        workplace: "Tech Corp",
        notes: "High-value client with multiple policies",
        status: "CLIENT",
        tags: {
          source: "Referral",
          priority: "High",
          interests: ["Auto", "Home"]
        },
        assignedToId: req.user.id
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        phone: "555-0102",
        address: "456 Oak Ave, Anytown, USA",
        birthdate: new Date("1990-06-20"),
        workplace: "Local Business",
        notes: "Regular referral source, interested in commercial insurance",
        status: "SOI",
        tags: {
          source: "Website",
          priority: "Medium",
          interests: ["Commercial"]
        },
        assignedToId: req.user.id
      },
      {
        name: "Carol White",
        email: "carol@example.com",
        phone: "555-0103",
        address: "789 Pine Rd, Anytown, USA",
        birthdate: new Date("1988-09-10"),
        workplace: "Self-employed",
        notes: "Interested in business insurance package",
        status: "LEAD",
        tags: {
          source: "Cold Call",
          priority: "Low",
          interests: ["Life"]
        },
        assignedToId: req.user.id
      }
    ];

    const result = await prisma.contact.createMany({
      data: testContacts,
      skipDuplicates: true
    });

    res.json({ message: `Created ${result.count} contacts` });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all events
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { createdById: req.user.id },
          { userId: req.user.id },
          { contact: { assignedToId: req.user.id } }
        ]
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Create new event
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, start, end, type, contactId } = req.body;

    // Validate required fields
    if (!title || !start || !end || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        type,
        contactId: contactId || null,
        createdById: req.user.id,
        userId: req.user.id
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start, end, type, contactId } = req.body;

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.createdById !== req.user.id && existingEvent.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        type,
        contactId: contactId || null
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.createdById !== req.user.id && existingEvent.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
