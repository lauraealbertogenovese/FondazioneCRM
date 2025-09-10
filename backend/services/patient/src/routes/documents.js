const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Patient = require('../models/Patient');
const PatientDocument = require('../models/PatientDocument');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/patient-documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `patient-${req.params.patientId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only DOC, DOCX, and PDF files
    const allowedTypes = ['.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only DOC, DOCX, and PDF files are allowed'));
    }
  }
});

// POST /patients/:patientId/documents - Upload document for patient
router.post('/patients/:patientId/documents', 
  AuthMiddleware.verifyToken, 
  AuthMiddleware.requirePermission('patients.write'),
  upload.single('document'),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const { document_type, description } = req.body;
      
      if (!Number.isInteger(Number(patientId)) || Number(patientId) < 1) {
        return res.status(400).json({
          error: 'Invalid patient ID'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      if (!document_type) {
        return res.status(400).json({
          error: 'Document type is required'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        // Clean up uploaded file
        await fs.unlink(req.file.path);
        return res.status(404).json({
          error: 'Patient not found'
        });
      }

      // Create document record
      const documentData = {
        patient_id: parseInt(patientId),
        filename: req.file.filename,
        original_filename: req.file.originalname,
        file_path: req.file.path,
        file_type: path.extname(req.file.originalname).toLowerCase(),
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        document_type: document_type,
        description: description || '',
        uploaded_by: req.user.id
      };

      const document = await PatientDocument.create(documentData);

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: document.toJSON()
      });
    } catch (error) {
      console.error('Upload document error:', error);
      
      // Clean up uploaded file if it exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
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

// GET /documents/:id - Get document by ID
router.get('/documents/:id', AuthMiddleware.verifyToken, AuthMiddleware.requirePermission('patients.read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid document ID'
      });
    }

    const document = await PatientDocument.findById(id);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    res.json({
      document: document.toJSON()
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /documents/:id/download - Download document
router.get('/documents/:id/download', AuthMiddleware.verifyToken, AuthMiddleware.requirePermission('patients.read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid document ID'
      });
    }

    const document = await PatientDocument.findById(id);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.file_path);
    } catch (error) {
      return res.status(404).json({
        error: 'File not found on disk'
      });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Length', document.file_size);

    // Stream the file
    const fileStream = require('fs').createReadStream(document.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /documents/:id - Update document metadata
router.put('/documents/:id', AuthMiddleware.verifyToken, AuthMiddleware.requirePermission('patients.write'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid document ID'
      });
    }

    // Check if document exists
    const document = await PatientDocument.findById(id);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Update document
    await document.update(updateData);

    res.json({
      message: 'Document updated successfully',
      document: document.toJSON()
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// DELETE /documents/:id - Delete document
router.delete('/documents/:id', AuthMiddleware.verifyToken, AuthMiddleware.requirePermission('patients.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid document ID'
      });
    }

    // Check if document exists
    const document = await PatientDocument.findById(id);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Delete file from disk
    try {
      await fs.unlink(document.file_path);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document record
    await document.delete();

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /documents/types/:type - Get documents by type
router.get('/documents/types/:type', AuthMiddleware.verifyToken, AuthMiddleware.requirePermission('patients.read'), async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const documents = await PatientDocument.findByDocumentType(type, parseInt(limit), parseInt(offset));
    
    res.json({
      documents: documents.map(doc => doc.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get documents by type error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
