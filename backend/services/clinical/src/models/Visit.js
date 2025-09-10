const pool = require('../database/connection');

class Visit {
  // Crea una nuova visita
  static async create(visitData) {
    const {
      clinical_record_id,
      visit_type,
      visit_date,
      doctor_name,
      visit_notes,
      follow_up_date,
      status = 'completed',
      created_by
    } = visitData;

    const query = `
      INSERT INTO clinical.visits 
      (clinical_record_id, visit_type, visit_date, doctor_name, visit_notes, follow_up_date, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      clinical_record_id, visit_type, visit_date, doctor_name, visit_notes, 
      follow_up_date, status, created_by
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trova visita per ID
  static async findById(id) {
    const query = `
      SELECT v.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.visits v
      LEFT JOIN clinical.clinical_records cr ON v.clinical_record_id = cr.id
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON v.created_by = u.id
      WHERE v.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trova visita specifica per record clinico, data e tipo
  static async findByClinicalRecordDateType(clinicalRecordId, visitDate, visitType) {
    const query = `
      SELECT v.*, 
             u.username as created_by_username
      FROM clinical.visits v
      LEFT JOIN auth.users u ON v.created_by = u.id
      WHERE v.clinical_record_id = $1 AND v.visit_date = $2 AND v.visit_type = $3
    `;
    
    try {
      const result = await pool.query(query, [clinicalRecordId, visitDate, visitType]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trova tutte le visite di un paziente
  static async findByPatientId(patientId, limit = 50, offset = 0) {
    const query = `
      SELECT v.*, 
             u.username as created_by_username
      FROM clinical.visits v
      LEFT JOIN auth.users u ON v.created_by = u.id
      WHERE v.patient_id = $1
      ORDER BY v.visit_date DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [patientId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Lista tutte le visite con filtri
  static async findAll(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT v.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.visits v
      LEFT JOIN clinical.clinical_records cr ON v.clinical_record_id = cr.id
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON v.created_by = u.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Filtri
    if (filters.visit_type) {
      paramCount++;
      conditions.push(`v.visit_type = $${paramCount}`);
      values.push(filters.visit_type);
    }

    if (filters.patient_id) {
      paramCount++;
      conditions.push(`v.patient_id = $${paramCount}`);
      values.push(filters.patient_id);
    }

    if (filters.created_by) {
      paramCount++;
      conditions.push(`v.created_by = $${paramCount}`);
      values.push(filters.created_by);
    }

    if (filters.date_from) {
      paramCount++;
      conditions.push(`v.visit_date >= $${paramCount}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      paramCount++;
      conditions.push(`v.visit_date <= $${paramCount}`);
      values.push(filters.date_to);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY v.visit_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Aggiorna visita
  static async update(id, updateData) {
    const {
      visit_type,
      visit_date,
      duration_minutes,
      notes,
      diagnosis,
      treatment_plan,
      next_visit_date
    } = updateData;

    const query = `
      UPDATE clinical.visits 
      SET visit_type = $1, visit_date = $2, duration_minutes = $3, notes = $4, 
          diagnosis = $5, treatment_plan = $6, next_visit_date = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      visit_type, visit_date, duration_minutes, notes, 
      diagnosis, treatment_plan, next_visit_date, id
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Elimina visita
  static async delete(id) {
    const query = 'DELETE FROM clinical.visits WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Conta visite per paziente
  static async countByPatientId(patientId) {
    const query = 'SELECT COUNT(*) as count FROM clinical.visits WHERE patient_id = $1';

    try {
      const result = await pool.query(query, [patientId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Trova prossime visite
  static async findUpcoming(limit = 20) {
    const query = `
      SELECT v.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.visits v
      LEFT JOIN clinical.clinical_records cr ON v.clinical_record_id = cr.id
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON v.created_by = u.id
      WHERE v.visit_date >= CURRENT_DATE
      ORDER BY v.visit_date ASC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Visit;
