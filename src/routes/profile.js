import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fetch from 'node-fetch';
import { authenticateToken } from '../middleware/auth.js';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';

const router = express.Router();
const prisma = new PrismaClient();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true,
  maxAttempts: 3,
  retryMode: 'standard',
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5000,
    socketTimeout: 5000
  })
});

// Add middleware to log all requests and verify AWS configuration
router.use((req, res, next) => {
  // Verify AWS configuration on each request
  const missingConfigs = [];
  if (!process.env.AWS_REGION) missingConfigs.push('AWS_REGION');
  if (!process.env.AWS_ACCESS_KEY_ID) missingConfigs.push('AWS_ACCESS_KEY_ID');
  if (!process.env.AWS_SECRET_ACCESS_KEY) missingConfigs.push('AWS_SECRET_ACCESS_KEY');
  if (!process.env.AWS_PROFILE_BUCKET_NAME) missingConfigs.push('AWS_PROFILE_BUCKET_NAME');

  if (missingConfigs.length > 0) {
    console.error('Missing AWS configurations:', missingConfigs);
  }

  console.log('AWS Environment:', {
    region: process.env.AWS_REGION,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_PROFILE_BUCKET_NAME
  });
  next();
});

// Get pre-signed URL for S3 upload
router.get('/upload-url', authenticateToken, async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ message: 'Filename and content type are required' });
    }

    // Generate a unique key for the file
    const key = `${req.user.id}/${Date.now()}-${filename}`;
    
    // Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    // Generate pre-signed URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Generate the public URL for the uploaded image
    const imageUrl = `https://${process.env.AWS_PROFILE_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    res.json({ url, imageUrl });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// Update profile picture URL
router.post('/picture', authenticateToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Update user's profile picture URL in the database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Error updating profile picture' });
  }
});

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /api/profile - Fetching user profile');
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subordinates: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('User profile fetched:', user);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a pre-signed URL if user has a profile picture
    if (user.profilePicture) {
      try {
        const getObjectParams = {
          Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
          Key: user.profilePicture
        };
        const preSignedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });
        user.profilePictureUrl = preSignedUrl;
      } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        // Don't fail the request if we can't generate the URL
        user.profilePictureUrl = null;
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  console.log('PUT /api/profile - Updating user profile');
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    console.log('User exists:', user);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // If password change is requested
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      console.log('Current password is valid:', isPasswordValid);
      if (!isPasswordValid) {
        console.log('Current password is incorrect');
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('User profile updated:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Email already in use');
      return res.status(400).json({ message: 'Email already in use' });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  console.log('GET /api/profile/stats - Fetching user stats');
  try {
    console.log('Fetching stats for user:', req.user.id);
    const userId = req.user.id;

    // Get counts of various user-related data
    const [contactCount, documentCount, activityCount] = await Promise.all([
      prisma.contact.count({
        where: {
          assignedTo: {
            id: userId
          }
        }
      }).catch(err => {
        console.error('Error counting contacts:', err);
        throw err;
      }),
      prisma.document.count({
        where: {
          user: {
            id: userId
          }
        }
      }).catch(err => {
        console.error('Error counting documents:', err);
        throw err;
      }),
      prisma.activity.count({
        where: {
          user: {
            id: userId
          }
        }
      }).catch(err => {
        console.error('Error counting activities:', err);
        throw err;
      })
    ]);

    console.log('Stats retrieved:', { contactCount, documentCount, activityCount });
    res.json({
      contacts: contactCount,
      documents: documentCount,
      activities: activityCount
    });
  } catch (error) {
    console.error('Detailed error in /stats:', error);
    res.status(500).json({ 
      message: 'Error fetching user stats',
      details: error.message 
    });
  }
});

// Get user statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  console.log('GET /api/profile/statistics - Fetching user statistics');
  try {
    const [contactCount, taskCount, documentCount, eventCount] = await Promise.all([
      prisma.contact.count({ where: { userId: req.user.id } }),
      prisma.task.count({ where: { assignedToId: req.user.id } }),
      prisma.document.count({ where: { userId: req.user.id } }),
      prisma.event.count({ where: { userId: req.user.id } })
    ]);

    console.log('Statistics retrieved:', { contactCount, taskCount, documentCount, eventCount });
    res.json({
      contacts: contactCount,
      tasks: taskCount,
      documents: documentCount,
      events: eventCount
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete profile picture
router.delete('/picture', authenticateToken, async (req, res) => {
  console.log('DELETE /api/profile/picture - Deleting profile picture');
  try {
    // Remove profile picture URL from user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: null },
      select: {
        id: true,
        profilePicture: true
      }
    });

    console.log('User profile updated:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Error deleting profile picture' });
  }
});

export default router;
