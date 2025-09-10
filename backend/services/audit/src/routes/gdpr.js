const express = require('express');
const router = express.Router();
const GDPRConsent = require('../models/GDPRConsent');
const { verifyToken, requireGDPRAccess } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireGDPRAccess);

// GET /gdpr/consents/:patientId - Get patient consents
router.get('/consents/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const consents = await GDPRConsent.getPatientConsents(patientId);
    
    // Convert to object format expected by frontend
    const consentMap = {};
    consents.forEach(consent => {
      consentMap[consent.consent_type] = {
        granted: consent.granted,
        date: consent.granted ? consent.consent_date : consent.revocation_date,
        version: consent.version,
        ip_address: consent.ip_address,
        user_agent: consent.user_agent,
        legal_basis: consent.legal_basis,
        purpose: consent.purpose,
        notes: consent.notes
      };
    });
    
    // Ensure all consent types are present
    const defaultConsents = {
      data_processing: { granted: false, date: null, version: null, ip_address: null, user_agent: null },
      marketing: { granted: false, date: null, version: null, ip_address: null, user_agent: null },
      research: { granted: false, date: null, version: null, ip_address: null, user_agent: null },
      data_sharing: { granted: false, date: null, version: null, ip_address: null, user_agent: null },
      cookies: { granted: false, date: null, version: null, ip_address: null, user_agent: null }
    };
    
    const result = { ...defaultConsents, ...consentMap };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching patient consents:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching patient consents'
    });
  }
});

// PUT /gdpr/consents/:patientId/:consentType - Update consent
router.put('/consents/:patientId/:consentType', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const consentType = req.params.consentType;
    
    const consentData = {
      patient_id: patientId,
      consent_type: consentType,
      granted: req.body.granted,
      version: req.body.version || '1.0',
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      legal_basis: req.body.legal_basis,
      purpose: req.body.purpose,
      notes: req.body.notes,
      user_id: req.user.id,
      user_name: req.user.username || `${req.user.first_name} ${req.user.last_name}`.trim()
    };
    
    const consent = await GDPRConsent.updateConsent(consentData);
    
    res.json({
      success: true,
      message: `Consent ${consentData.granted ? 'granted' : 'revoked'} successfully`,
      data: consent
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating consent'
    });
  }
});

// GET /gdpr/consents/:patientId/history - Get consent history
router.get('/consents/:patientId/history', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const consentType = req.query.consent_type;
    
    const history = await GDPRConsent.getConsentHistory(patientId, consentType);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching consent history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching consent history'
    });
  }
});

// GET /gdpr/retention/:patientId - Get retention status
router.get('/retention/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const retentionStatus = await GDPRConsent.getRetentionStatus(patientId);
    
    res.json({
      success: true,
      data: retentionStatus
    });
  } catch (error) {
    console.error('Error fetching retention status:', error);
    if (error.message === 'Patient not found') {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error fetching retention status'
    });
  }
});

// POST /gdpr/requests - Create data subject request
router.post('/requests', async (req, res) => {
  try {
    const requestData = {
      request_type: req.body.request_type,
      patient_id: req.body.patient_id ? parseInt(req.body.patient_id) : null,
      patient_name: req.body.patient_name,
      patient_email: req.body.patient_email,
      assigned_to: req.body.assigned_to ? parseInt(req.body.assigned_to) : req.user.id,
      notes: req.body.notes
    };
    
    const request = await GDPRConsent.createDataRequest(requestData);
    
    res.status(201).json({
      success: true,
      message: 'Data subject request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Error creating data request:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating data request'
    });
  }
});

// GET /gdpr/requests - Get data subject requests
router.get('/requests', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      request_type: req.query.request_type,
      patient_id: req.query.patient_id ? parseInt(req.query.patient_id) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });
    
    const requests = await GDPRConsent.getDataRequests(filters);
    
    res.json({
      success: true,
      data: requests,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching data requests:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching data requests'
    });
  }
});

// PUT /gdpr/requests/:id/status - Update request status
router.put('/requests/:id/status', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    const request = await GDPRConsent.updateDataRequestStatus(requestId, status, notes);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Data request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating request status'
    });
  }
});

// GET /gdpr/compliance/summary - Get compliance summary
router.get('/compliance/summary', async (req, res) => {
  try {
    const summary = await GDPRConsent.getComplianceSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching compliance summary:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching compliance summary'
    });
  }
});

// GET /gdpr/consents/:patientId/:consentType/check - Check specific consent
router.get('/consents/:patientId/:consentType/check', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const consentType = req.params.consentType;
    
    const consent = await GDPRConsent.hasConsent(patientId, consentType);
    
    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    console.error('Error checking consent:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking consent'
    });
  }
});

// GET /gdpr/consent-types - Get available consent types
router.get('/consent-types', async (req, res) => {
  try {
    const consentTypes = [
      {
        type: 'data_processing',
        name: 'Trattamento Dati Personali',
        description: 'Consenso per il trattamento dei dati personali per finalità di cura',
        required: true,
        legal_basis: 'Consenso dell\'interessato'
      },
      {
        type: 'marketing',
        name: 'Comunicazioni Marketing',
        description: 'Consenso per l\'invio di comunicazioni commerciali e promozionali',
        required: false,
        legal_basis: 'Consenso dell\'interessato'
      },
      {
        type: 'research',
        name: 'Ricerca Scientifica',
        description: 'Consenso per l\'utilizzo dei dati per scopi di ricerca scientifica',
        required: false,
        legal_basis: 'Consenso dell\'interessato'
      },
      {
        type: 'data_sharing',
        name: 'Condivisione Dati',
        description: 'Consenso per la condivisione dei dati con terze parti autorizzate',
        required: false,
        legal_basis: 'Consenso dell\'interessato'
      },
      {
        type: 'cookies',
        name: 'Cookie e Tracciamento',
        description: 'Consenso per l\'utilizzo di cookie e tecnologie di tracciamento',
        required: false,
        legal_basis: 'Consenso dell\'interessato'
      }
    ];
    
    res.json({
      success: true,
      data: consentTypes
    });
  } catch (error) {
    console.error('Error fetching consent types:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching consent types'
    });
  }
});

module.exports = router;