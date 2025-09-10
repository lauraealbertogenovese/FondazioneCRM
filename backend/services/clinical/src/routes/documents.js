const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClinicalDocument = require('../models/ClinicalDocument');
const ClinicalRecord = require('../models/ClinicalRecord');
const Visit = require('../models/Visit');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/clinical');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `clinical-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.doc', '.docx', '.pdf', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only DOC, DOCX, PDF, TXT, JPG, PNG, GIF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// POST /clinical-records/:recordId/documents - Upload document for clinical record
router.post('/clinical-records/:recordId/documents',
  authenticateToken,
  requirePermission('clinical.write'),
  upload.single('file'),
  async (req, res) => {
    try {
      const { recordId } = req.params;
      const { document_type, description } = req.body;
      const file = req.file;

      console.log('Upload clinical document request:', {
        recordId,
        document_type,
        description,
        file: file ? {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        } : 'No file'
      });

      if (!Number.isInteger(Number(recordId)) || Number(recordId) < 1) {
        return res.status(400).json({
          error: 'Invalid clinical record ID'
        });
      }

      if (!file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      if (!document_type) {
        return res.status(400).json({
          error: 'Document type is required'
        });
      }

      // Check if clinical record exists
      const clinicalRecord = await ClinicalRecord.findById(recordId);
      if (!clinicalRecord) {
        return res.status(404).json({
          error: 'Clinical record not found'
        });
      }

      // Create document record
      const documentData = {
        clinical_record_id: recordId,
        visit_id: null, // Can be set later if needed
        filename: file.filename,
        original_filename: file.originalname,
        file_path: file.path,
        file_type: path.extname(file.originalname).toLowerCase(),
        file_size: file.size,
        mime_type: file.mimetype,
        document_type: document_type,
        description: description || '',
        uploaded_by: req.user.id
      };

      const document = await ClinicalDocument.create(documentData);

      res.status(201).json({
        success: true,
        data: document.toJSON()
      });
    } catch (error) {
      console.error('Error uploading clinical document:', error);
      
      // Clean up uploaded file if database operation failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// GET /clinical-records/:recordId/documents - Get all documents for a clinical record
router.get('/clinical-records/:recordId/documents',
  authenticateToken,
  requirePermission('clinical.read'),
  async (req, res) => {
    try {
      const { recordId } = req.params;
      
      if (!Number.isInteger(Number(recordId)) || Number(recordId) < 1) {
        return res.status(400).json({
          error: 'Invalid clinical record ID'
        });
      }

      // Check if clinical record exists
      const clinicalRecord = await ClinicalRecord.findById(recordId);
      if (!clinicalRecord) {
        return res.status(404).json({
          error: 'Clinical record not found'
        });
      }

      // Get all documents for this clinical record
      const documents = await ClinicalDocument.findByClinicalRecordId(recordId);

      res.json({
        success: true,
        data: documents.map(doc => doc.toJSON())
      });
    } catch (error) {
      console.error('Error fetching clinical record documents:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// GET /documents/:id - Get document by ID
router.get('/documents/:id',
  authenticateToken,
  requirePermission('clinical.read'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: 'Invalid document ID'
        });
      }

      const document = await ClinicalDocument.findById(id);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      res.json({
        success: true,
        data: document.toJSON()
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// DELETE /documents/:id - Delete document
router.delete('/documents/:id',
  authenticateToken,
  requirePermission('clinical.write'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: 'Invalid document ID'
        });
      }

      // Get document info before deleting
      const document = await ClinicalDocument.findById(id);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Delete from database
      const deleted = await ClinicalDocument.delete(id);
      if (!deleted) {
        return res.status(500).json({
          error: 'Failed to delete document'
        });
      }

      // Delete file from filesystem
      try {
        if (fs.existsSync(document.file_path)) {
          fs.unlinkSync(document.file_path);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Don't fail the request if file deletion fails
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// GET /documents/:id/download - Download document file
router.get('/documents/:id/download',
  authenticateToken,
  requirePermission('clinical.read'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: 'Invalid document ID'
        });
      }

      // Get document info
      const document = await ClinicalDocument.findById(id);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Check if file exists
      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({
          error: 'File not found on disk'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Type', document.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(document.file_path);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });

    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

module.exports = router;
