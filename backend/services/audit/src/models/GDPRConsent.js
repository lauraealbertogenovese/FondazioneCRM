const { query } = require('../utils/database');

class GDPRConsent {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.consent_type = data.consent_type;
    this.granted = data.granted;
    this.consent_date = data.consent_date;
    this.revocation_date = data.revocation_date;
    this.version = data.version;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.legal_basis = data.legal_basis;
    this.purpose = data.purpose;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get patient consents
  static async getPatientConsents(patientId) {
    try {
      const result = await query(`
        SELECT * FROM audit.gdpr_consents
        WHERE patient_id = $1
        ORDER BY consent_type
      `, [patientId]);
      
      return result.rows.map(row => new GDPRConsent(row));
    } catch (error) {
      console.error('Error fetching patient consents:', error);
      throw error;
    }
  }

  // Update or create consent
  static async updateConsent(consentData) {
    try {
      const { 
        patient_id, 
        consent_type, 
        granted, 
        version = '1.0',
        ip_address,
        user_agent,
        legal_basis,
        purpose,
        notes,
        user_id,
        user_name
      } = consentData;

      // Upsert consent record
      const upsertQuery = `
        INSERT INTO audit.gdpr_consents (
          patient_id, consent_type, granted, consent_date, revocation_date,
          version, ip_address, user_agent, legal_basis, purpose, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (patient_id, consent_type) 
        DO UPDATE SET
          granted = $3,
          consent_date = CASE WHEN $3 = true THEN $4 ELSE gdpr_consents.consent_date END,
          revocation_date = CASE WHEN $3 = false THEN $4 ELSE NULL END,
          version = $6,
          ip_address = $7,
          user_agent = $8,
          legal_basis = $9,
          purpose = $10,
          notes = $11,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const currentDate = new Date();
      const values = [
        patient_id,
        consent_type,
        granted,
        granted ? currentDate : null,
        !granted ? currentDate : null,
        version,
        ip_address,
        user_agent,
        legal_basis,
        purpose,
        notes
      ];

      const result = await query(upsertQuery, values);
      const consent = new GDPRConsent(result.rows[0]);

      // Log to consent history
      await query(`
        INSERT INTO audit.gdpr_consent_history (
          consent_id, patient_id, consent_type, action, granted,
          version, user_id, user_name, ip_address, user_agent, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        consent.id,
        patient_id,
        consent_type,
        granted ? 'granted' : 'revoked',
        granted,
        version,
        user_id,
        user_name,
        ip_address,
        user_agent,
        notes
      ]);

      return consent;
    } catch (error) {
      console.error('Error updating consent:', error);
      throw error;
    }
  }

  // Get consent history
  static async getConsentHistory(patientId, consentType = null) {
    try {
      let queryText = `
        SELECT * FROM audit.gdpr_consent_history
        WHERE patient_id = $1
      `;
      const params = [patientId];

      if (consentType) {
        queryText += ` AND consent_type = $2`;
        params.push(consentType);
      }

      queryText += ` ORDER BY created_at DESC`;

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching consent history:', error);
      throw error;
    }
  }

  // Get retention status for patient
  static async getRetentionStatus(patientId) {
    try {
      // Get patient creation date and last activity
      const patientResult = await query(`
        SELECT 
          created_at as creation_date,
          updated_at as last_activity
        FROM patient.patients 
        WHERE id = $1
      `, [patientId]);

      if (patientResult.rows.length === 0) {
        throw new Error('Patient not found');
      }

      const patient = patientResult.rows[0];

      // Get retention policy for patient data
      const policyResult = await query(`
        SELECT retention_period_months 
        FROM audit.gdpr_retention_policies 
        WHERE entity_type = 'patient'
      `);

      const retentionMonths = policyResult.rows[0]?.retention_period_months || 120; // Default 10 years
      const retentionDate = new Date();
      retentionDate.setMonth(retentionDate.getMonth() - retentionMonths);

      // Calculate if data can be deleted
      const canDelete = new Date(patient.last_activity) < retentionDate;
      const daysUntilDeletion = canDelete ? 0 : Math.ceil(
        (retentionDate.getTime() - new Date(patient.last_activity).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        creation_date: patient.creation_date,
        last_activity: patient.last_activity,
        retention_period_months: retentionMonths,
        retention_deadline: retentionDate,
        can_delete: canDelete,
        days_until_deletion: Math.abs(daysUntilDeletion),
        status: canDelete ? 'eligible_for_deletion' : 'retained'
      };
    } catch (error) {
      console.error('Error getting retention status:', error);
      throw error;
    }
  }

  // Create data subject request
  static async createDataRequest(requestData) {
    try {
      const queryText = `
        INSERT INTO audit.gdpr_data_requests (
          request_type, patient_id, patient_name, patient_email,
          assigned_to, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        requestData.request_type,
        requestData.patient_id,
        requestData.patient_name,
        requestData.patient_email,
        requestData.assigned_to,
        requestData.notes
      ];

      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating data request:', error);
      throw error;
    }
  }

  // Get data requests
  static async getDataRequests(filters = {}) {
    try {
      let queryText = `
        SELECT * FROM audit.gdpr_data_requests
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        queryText += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.request_type) {
        queryText += ` AND request_type = $${paramCount}`;
        params.push(filters.request_type);
        paramCount++;
      }

      if (filters.patient_id) {
        queryText += ` AND patient_id = $${paramCount}`;
        params.push(filters.patient_id);
        paramCount++;
      }

      queryText += ` ORDER BY request_date DESC`;

      if (filters.limit) {
        queryText += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
        paramCount++;
      }

      if (filters.offset) {
        queryText += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching data requests:', error);
      throw error;
    }
  }

  // Update data request status
  static async updateDataRequestStatus(requestId, status, notes = null) {
    try {
      const updateQuery = `
        UPDATE audit.gdpr_data_requests
        SET 
          status = $1,
          completion_date = CASE WHEN $1 IN ('completed', 'rejected') THEN CURRENT_TIMESTAMP ELSE completion_date END,
          notes = COALESCE($2, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await query(updateQuery, [status, notes, requestId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating data request status:', error);
      throw error;
    }
  }

  // Get GDPR compliance summary
  static async getComplianceSummary() {
    try {
      const summary = await query(`
        SELECT 
          (SELECT COUNT(*) FROM audit.gdpr_consents WHERE granted = true) as active_consents,
          (SELECT COUNT(*) FROM audit.gdpr_consents WHERE granted = false) as revoked_consents,
          (SELECT COUNT(*) FROM audit.gdpr_data_requests WHERE status = 'pending') as pending_requests,
          (SELECT COUNT(*) FROM audit.gdpr_data_requests WHERE status = 'completed') as completed_requests,
          (SELECT COUNT(*) FROM audit.gdpr_data_requests WHERE request_date > CURRENT_DATE - INTERVAL '30 days') as requests_last_30days
      `);

      return summary.rows[0];
    } catch (error) {
      console.error('Error getting compliance summary:', error);
      throw error;
    }
  }

  // Check if patient has given consent for specific purpose
  static async hasConsent(patientId, consentType) {
    try {
      const result = await query(`
        SELECT granted, consent_date, version
        FROM audit.gdpr_consents
        WHERE patient_id = $1 AND consent_type = $2
      `, [patientId, consentType]);

      return result.rows[0] || { granted: false, consent_date: null, version: null };
    } catch (error) {
      console.error('Error checking consent:', error);
      throw error;
    }
  }
}

module.exports = GDPRConsent;