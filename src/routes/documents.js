import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multerS3 from 'multer-s3';
import path from 'path';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `uploads/${req.user.id}/${uniqueSuffix}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Add file type validation here
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload document
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('Starting document upload...');
    console.log('Request user:', req.user);
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    const { taskId } = req.body;
    const file = req.file;

    if (!file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Creating document in database with data:', {
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.key,
      userId: req.user.id,
      taskId: taskId ? parseInt(taskId) : null
    });

    const document = await prisma.document.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.key,
        userId: req.user.id,
        taskId: taskId ? parseInt(taskId) : null
      }
    });

    console.log('Document created successfully:', document);
    res.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error uploading document',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all documents for a user with relationships
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        policy: {
          select: {
            id: true,
            policyNumber: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Get document details by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        policy: {
          select: {
            id: true,
            policyNumber: true,
            type: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate a pre-signed URL for downloading
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: document.filePath
    });
    
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    
    res.json({ ...document, downloadUrl });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Error fetching document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this document' });
    }

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: document.filePath
    }));

    // Delete from database
    await prisma.document.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Error deleting document' });
  }
});

export default router;
