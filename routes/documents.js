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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Get pre-signed URL for document upload
router.get('/upload-url', authenticateToken, async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ message: 'Filename and content type are required' });
    }

    const key = `documents/${req.user.id}/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_DOCUMENTS_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read'
    });

    // Generate pre-signed URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ url, key });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
});

// Get all documents for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Save document metadata after successful upload
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, key, size, type } = req.body;

    const document = await prisma.document.create({
      data: {
        name,
        key,
        size,
        type,
        userId: req.user.id
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ message: 'Failed to save document' });
  }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_DOCUMENTS_BUCKET_NAME,
      Key: document.key
    });
    await s3Client.send(deleteCommand);

    // Delete from database
    await prisma.document.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Get download URL for a document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_DOCUMENTS_BUCKET_NAME,
      Key: document.key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ message: 'Failed to generate download URL' });
  }
});

export default router;
