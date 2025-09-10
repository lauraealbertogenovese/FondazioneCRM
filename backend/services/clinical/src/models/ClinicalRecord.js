const pool = require('../database/connection');

class ClinicalRecord {
  // Crea una nuova cartella clinica
  static async create(recordData) {
    const {
      patient_id,
      record_number,
      status = 'active',
      diagnosis,
      treatment_plan,
      notes,
      created_by
    } = recordData;

    // Genera record_number se non fornito
    const finalRecordNumber = record_number || `CR-${Date.now()}`;

    const query = `
      INSERT INTO clinical.clinical_records 
      (patient_id, record_number, status, diagnosis, treatment_plan, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      patient_id, finalRecordNumber, status, diagnosis, 
      treatment_plan, notes, created_by
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trova cartella clinica per ID
  static async findById(id) {
    const query = `
      SELECT cr.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.clinical_records cr
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON cr.created_by = u.id
      WHERE cr.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trova tutte le cartelle cliniche di un paziente
  static async findByPatientId(patientId, limit = 50, offset = 0) {
    const query = `
      SELECT cr.*, 
             u.username as created_by_username
      FROM clinical.clinical_records cr
      LEFT JOIN auth.users u ON cr.created_by = u.id
      WHERE cr.patient_id = $1
      ORDER BY cr.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [patientId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Trova cartella clinica per record number
  static async findByRecordNumber(recordNumber) {
    const query = `
      SELECT cr.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.clinical_records cr
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON cr.created_by = u.id
      WHERE cr.record_number = $1
    `;

    try {
      const result = await pool.query(query, [recordNumber]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lista tutte le cartelle cliniche con filtri
  static async findAll(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT cr.*, 
             p.nome as first_name, p.cognome as last_name, p.codice_fiscale,
             u.username as created_by_username
      FROM clinical.clinical_records cr
      LEFT JOIN patient.patients p ON cr.patient_id = p.id
      LEFT JOIN auth.users u ON cr.created_by = u.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Filtri
    // record_type rimosso - colonna non presente nella tabella

    if (filters.patient_id) {
      paramCount++;
      conditions.push(`cr.patient_id = $${paramCount}`);
      values.push(filters.patient_id);
    }

    if (filters.created_by) {
      paramCount++;
      conditions.push(`cr.created_by = $${paramCount}`);
      values.push(filters.created_by);
    }

    if (filters.date_from) {
      paramCount++;
      conditions.push(`cr.created_at >= $${paramCount}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      paramCount++;
      conditions.push(`cr.created_at <= $${paramCount}`);
      values.push(filters.date_to);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY cr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Aggiorna cartella clinica
  static async update(id, updateData) {
    const {
      title,
      description,
      notes,
      record_type,
      record_number,
      status,
      diagnosis,
      treatment_plan
    } = updateData;

    // Build dynamic query based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    if (record_type !== undefined) {
      updateFields.push(`record_type = $${paramIndex}`);
      values.push(record_type);
      paramIndex++;
    }

    if (record_number !== undefined) {
      updateFields.push(`record_number = $${paramIndex}`);
      values.push(record_number);
      paramIndex++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (diagnosis !== undefined) {
      updateFields.push(`diagnosis = $${paramIndex}`);
      values.push(diagnosis);
      paramIndex++;
    }

    if (treatment_plan !== undefined) {
      updateFields.push(`treatment_plan = $${paramIndex}`);
      values.push(treatment_plan);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add the id parameter
    values.push(id);

    const query = `
      UPDATE clinical.clinical_records 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Elimina cartella clinica
  static async delete(id) {
    const query = 'DELETE FROM clinical.clinical_records WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Conta cartelle cliniche per paziente
  static async countByPatientId(patientId) {
    const query = 'SELECT COUNT(*) as count FROM clinical.clinical_records WHERE patient_id = $1';

    try {
      const result = await pool.query(query, [patientId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_clinical_records,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_records,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_records,
        COUNT(DISTINCT patient_id) as total_patients_with_records
      FROM clinical.clinical_records
    `;

    try {
      const result = await pool.query(query);
      const stats = result.rows[0];
      
      // Convert string numbers to integers
      return {
        total_clinical_records: parseInt(stats.total_clinical_records) || 0,
        today_records: parseInt(stats.today_records) || 0,
        recent_records: parseInt(stats.recent_records) || 0,
        total_patients_with_records: parseInt(stats.total_patients_with_records) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClinicalRecord;
