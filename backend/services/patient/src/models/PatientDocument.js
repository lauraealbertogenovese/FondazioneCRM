const { query } = require('../database/connection');

class PatientDocument {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filename = data.filename;
    this.original_filename = data.original_filename;
    this.file_path = data.file_path;
    this.file_type = data.file_type;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.document_type = data.document_type;
    this.description = data.description;
    this.uploaded_by = data.uploaded_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new document
  static async create(documentData) {
    const {
      patient_id,
      filename,
      original_filename,
      file_path,
      file_type,
      file_size,
      mime_type,
      document_type,
      description,
      uploaded_by
    } = documentData;
    
    const queryText = `
      INSERT INTO patient.patient_documents (
        patient_id, filename, original_filename, file_path, file_type,
        file_size, mime_type, document_type, description, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      patient_id, filename, original_filename, file_path, file_type,
      file_size, mime_type, document_type, description, uploaded_by
    ];
    
    const result = await query(queryText, values);
    return new PatientDocument(result.rows[0]);
  }

  // Find document by ID
  static async findById(id) {
    const queryText = `
      SELECT pd.*, u.username as uploaded_by_username
      FROM patient.patient_documents pd
      LEFT JOIN auth.users u ON pd.uploaded_by = u.id
      WHERE pd.id = $1
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] ? new PatientDocument(result.rows[0]) : null;
  }

  // Find documents by patient ID
  static async findByPatientId(patientId) {
    const queryText = `
      SELECT pd.*, u.username as uploaded_by_username
      FROM patient.patient_documents pd
      LEFT JOIN auth.users u ON pd.uploaded_by = u.id
      WHERE pd.patient_id = $1
      ORDER BY pd.created_at DESC
    `;
    
    const result = await query(queryText, [patientId]);
    return result.rows.map(row => new PatientDocument(row));
  }

  // Find documents by type
  static async findByDocumentType(documentType, limit = 10, offset = 0) {
    const queryText = `
      SELECT pd.*, u.username as uploaded_by_username
      FROM patient.patient_documents pd
      LEFT JOIN auth.users u ON pd.uploaded_by = u.id
      WHERE pd.document_type = $1
      ORDER BY pd.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(queryText, [documentType, limit, offset]);
    return result.rows.map(row => new PatientDocument(row));
  }

  // Update document
  async update(updateData) {
    const allowedFields = ['description', 'document_type'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const queryText = `
      UPDATE patient.patient_documents 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    const updatedDocument = result.rows[0];
    
    // Update current instance
    Object.assign(this, updatedDocument);
    return this;
  }

  // Delete document
  async delete() {
    const queryText = `
      DELETE FROM patient.patient_documents
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(queryText, [this.id]);
    return result.rows[0] ? new PatientDocument(result.rows[0]) : null;
  }

  // Get document data
  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      filename: this.filename,
      original_filename: this.original_filename,
      file_path: this.file_path,
      file_type: this.file_type,
      file_size: this.file_size,
      mime_type: this.mime_type,
      document_type: this.document_type,
      description: this.description,
      uploaded_by: this.uploaded_by,
      uploaded_by_username: this.uploaded_by_username,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PatientDocument;
