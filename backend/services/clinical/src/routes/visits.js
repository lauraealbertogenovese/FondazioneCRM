const express = require('express');
const Visit = require('../models/Visit');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// GET /clinical/visits/calendar - Eventi calendario per range di date (temporarily without auth for testing)
router.get('/visits/calendar', async (req, res) => {
  try {
    const { start, end, doctor_id } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Parametri start e end sono richiesti' });
    }

    const filters = {
      date_from: start,
      date_to: end
    };
    
    if (doctor_id && !isNaN(doctor_id)) {
      filters.created_by = parseInt(doctor_id);
    }

    const visits = await Visit.findAll(filters, 1000, 0);
    
    // Trasforma le visite in formato FullCalendar
    const events = visits.map(visit => ({
      id: visit.id,
      title: `${visit.first_name || 'Nome'} ${visit.last_name || 'Cognome'}`,
      start: visit.visit_date,
      end: visit.visit_date ? new Date(new Date(visit.visit_date).getTime() + (visit.duration_minutes || 60) * 60000).toISOString() : null,
      extendedProps: {
        patient_id: visit.patient_id,
        patient_name: `${visit.first_name || 'Nome'} ${visit.last_name || 'Cognome'}`,
        visit_type: visit.visit_type,
        doctor_name: visit.doctor_name,
        status: visit.status,
        notes: visit.visit_notes,
        duration: visit.duration_minutes || 60,
        codice_fiscale: visit.codice_fiscale
      },
      backgroundColor: getEventColor(visit.status),
      borderColor: getEventColor(visit.status),
      textColor: '#ffffff'
    }));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Errore nel recupero degli eventi calendario' });
  }
});

// Applica autenticazione a tutte le altre route
router.use(authenticateToken);

// GET /clinical/visits - Lista visite
router.get('/visits', async (req, res) => {
  try {
    const { 
      patient_id, 
      visit_type, 
      created_by, 
      date_from, 
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const filters = {};
    if (patient_id) filters.patient_id = patient_id;
    if (visit_type) filters.visit_type = visit_type;
    if (created_by) filters.created_by = created_by;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const visits = await Visit.findAll(filters, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: visits,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: visits.length
      }
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// GET /clinical/visits/upcoming - Prossime visite (MUST be before /visits/:id)
router.get('/visits/upcoming', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit) || 20;
    const visits = await Visit.findUpcoming(limitNum);

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('Error fetching upcoming visits:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming visits' });
  }
});

// GET /clinical/visits/patient/:patientId - Visite di un paziente
router.get('/visits/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const visits = await Visit.findByPatientId(
      patientId, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: visits,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: visits.length
      }
    });
  } catch (error) {
    console.error('Error fetching patient visits:', error);
    res.status(500).json({ error: 'Failed to fetch patient visits' });
  }
});

// GET /clinical/visits/:id - Dettaglio visita (MUST be after specific routes)
router.get('/visits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({ error: 'Failed to fetch visit' });
  }
});


// PUT /clinical/visits/:id/reschedule - Riprogramma visita (per drag & drop)
router.put('/visits/:id/reschedule', requirePermission('clinical.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, duration_minutes } = req.body;

    if (!new_date) {
      return res.status(400).json({ error: 'Nuova data è richiesta' });
    }

    // Verifica che la visita esista
    const existingVisit = await Visit.findById(id);
    if (!existingVisit) {
      return res.status(404).json({ error: 'Visita non trovata' });
    }

    // Aggiorna la data della visita
    const updateData = {
      visit_date: new_date,
      status: 'rescheduled'
    };

    if (duration_minutes) {
      updateData.duration_minutes = duration_minutes;
    }

    const updatedVisit = await Visit.update(id, updateData);
    
    if (!updatedVisit) {
      return res.status(404).json({ error: 'Visita non trovata' });
    }

    res.json({ 
      message: 'Visita riprogrammata con successo',
      visit: updatedVisit 
    });
  } catch (error) {
    console.error('Error rescheduling visit:', error);
    res.status(500).json({ error: 'Errore nella riprogrammazione della visita' });
  }
});

// Funzione helper per i colori degli eventi
function getEventColor(status) {
  const colors = {
    scheduled: '#2563eb',    // Blue
    completed: '#10b981',    // Green  
    cancelled: '#ef4444',    // Red
    rescheduled: '#f59e0b'   // Orange
  };
  return colors[status] || colors.scheduled;
}

// POST /clinical/visits - Crea nuova visita
router.post('/visits', requirePermission('clinical.write'), async (req, res) => {
  try {
    const {
      patient_id,
      visit_type,
      visit_date,
      duration_minutes,
      notes,
      diagnosis,
      treatment_plan,
      next_visit_date
    } = req.body;

    // Validazione input
    if (!patient_id || !visit_type || !visit_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: patient_id, visit_type, visit_date' 
      });
    }

    const visitData = {
      patient_id,
      visit_type,
      visit_date,
      duration_minutes,
      notes,
      diagnosis,
      treatment_plan,
      next_visit_date,
      created_by: req.user.id
    };

    const newVisit = await Visit.create(visitData);

    res.status(201).json({
      success: true,
      data: newVisit,
      message: 'Visit created successfully'
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    res.status(500).json({ error: 'Failed to create visit' });
  }
});

// PUT /clinical/visits/:id - Aggiorna visita
router.put('/visits/:id', requirePermission('clinical.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verifica che la visita esista
    const existingVisit = await Visit.findById(id);
    if (!existingVisit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const updatedVisit = await Visit.update(id, updateData);

    res.json({
      success: true,
      data: updatedVisit,
      message: 'Visit updated successfully'
    });
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({ error: 'Failed to update visit' });
  }
});

// DELETE /clinical/visits/:id - Elimina visita
router.delete('/visits/:id', requirePermission('clinical.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che la visita esista
    const existingVisit = await Visit.findById(id);
    if (!existingVisit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    await Visit.delete(id);

    res.json({
      success: true,
      message: 'Visit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

// GET /clinical/visits/patient/:patientId/count - Conta visite di un paziente
router.get('/visits/patient/:patientId/count', async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await Visit.countByPatientId(patientId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error counting visits:', error);
    res.status(500).json({ error: 'Failed to count visits' });
  }
});

module.exports = router;
