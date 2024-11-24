import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
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
    
    // Create the PutObject command with specific headers
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read'
    });

    // Generate pre-signed URL with specific headers
    const url = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
      signableHeaders: new Set(['host', 'content-type'])
    });
    
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

// Get profile information
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has a profile picture, generate a signed URL
    if (user.profilePicture) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
        Key: user.profilePicture,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
      user.profilePictureUrl = signedUrl;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Delete profile picture
router.delete('/picture', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePicture: true },
    });

    if (!user.profilePicture) {
      return res.status(404).json({ message: 'No profile picture found' });
    }

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
      Key: user.profilePicture,
    }));

    // Update user profile
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: null },
    });

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Error deleting profile picture' });
  }
});

export default router;
