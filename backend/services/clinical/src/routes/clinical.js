const express = require('express');
const ClinicalRecord = require('../models/ClinicalRecord');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Applica autenticazione a tutte le route
router.use(authenticateToken);

// GET /clinical/statistics - Statistiche cartelle cliniche
router.get('/statistics', async (req, res) => {
  try {
    const stats = await ClinicalRecord.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching clinical statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch clinical statistics' 
    });
  }
});

// GET /clinical/records - Lista cartelle cliniche
router.get('/records', async (req, res) => {
  try {
    const { 
      patient_id, 
      record_type, 
      created_by, 
      date_from, 
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const filters = {};
    if (patient_id) filters.patient_id = patient_id;
    if (record_type) filters.record_type = record_type;
    if (created_by) filters.created_by = created_by;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const records = await ClinicalRecord.findAll(filters, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: records,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: records.length
      }
    });
  } catch (error) {
    console.error('Error fetching clinical records:', error);
    res.status(500).json({ error: 'Failed to fetch clinical records' });
  }
});

// GET /clinical/records/:id - Dettaglio cartella clinica
router.get('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ClinicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: 'Clinical record not found' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching clinical record:', error);
    res.status(500).json({ error: 'Failed to fetch clinical record' });
  }
});

// GET /clinical/records/patient/:patientId - Cartelle cliniche di un paziente
router.get('/records/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const records = await ClinicalRecord.findByPatientId(
      patientId, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: records,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: records.length
      }
    });
  } catch (error) {
    console.error('Error fetching patient clinical records:', error);
    res.status(500).json({ error: 'Failed to fetch patient clinical records' });
  }
});

// POST /clinical/records - Crea nuova cartella clinica
router.post('/records', requirePermission('clinical.write'), async (req, res) => {
  try {
    const {
      patient_id,
      record_type,
      title,
      description,
      diagnosis,
      treatment,
      medications,
      notes
    } = req.body;

    // Validazione input
    if (!patient_id || !record_type || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: patient_id, record_type, title' 
      });
    }

    const recordData = {
      patient_id,
      record_type,
      title,
      description,
      diagnosis,
      treatment,
      medications,
      notes,
      created_by: req.user.id
    };

    const newRecord = await ClinicalRecord.create(recordData);

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Clinical record created successfully'
    });
  } catch (error) {
    console.error('Error creating clinical record:', error);
    res.status(500).json({ error: 'Failed to create clinical record' });
  }
});

// PUT /clinical/records/:id - Aggiorna cartella clinica
router.put('/records/:id', requirePermission('clinical.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verifica che la cartella esista
    const existingRecord = await ClinicalRecord.findById(id);
    if (!existingRecord) {
      return res.status(404).json({ error: 'Clinical record not found' });
    }

    const updatedRecord = await ClinicalRecord.update(id, updateData);

    res.json({
      success: true,
      data: updatedRecord,
      message: 'Clinical record updated successfully'
    });
  } catch (error) {
    console.error('Error updating clinical record:', error);
    res.status(500).json({ error: 'Failed to update clinical record' });
  }
});

// DELETE /clinical/records/:id - Elimina cartella clinica
router.delete('/records/:id', requirePermission('clinical.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che la cartella esista
    const existingRecord = await ClinicalRecord.findById(id);
    if (!existingRecord) {
      return res.status(404).json({ error: 'Clinical record not found' });
    }

    await ClinicalRecord.delete(id);

    res.json({
      success: true,
      message: 'Clinical record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting clinical record:', error);
    res.status(500).json({ error: 'Failed to delete clinical record' });
  }
});

// GET /clinical/records/patient/:patientId/count - Conta cartelle cliniche di un paziente
router.get('/records/patient/:patientId/count', async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await ClinicalRecord.countByPatientId(patientId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error counting clinical records:', error);
    res.status(500).json({ error: 'Failed to count clinical records' });
  }
});


module.exports = router;
