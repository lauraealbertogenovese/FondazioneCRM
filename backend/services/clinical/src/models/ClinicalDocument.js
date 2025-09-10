const { query } = require('../database/connection');

class ClinicalDocument {
  constructor(data) {
    this.id = data.id;
    this.clinical_record_id = data.clinical_record_id;
    this.visit_id = data.visit_id;
    this.filename = data.filename;
    this.original_filename = data.original_filename;
    this.file_path = data.file_path;
    this.file_type = data.file_type;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.document_type = data.document_type;
    this.description = data.description;
    this.uploaded_by = data.uploaded_by;
    this.uploaded_by_username = data.uploaded_by_username;
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      clinical_record_id: this.clinical_record_id,
      visit_id: this.visit_id,
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
      created_at: this.created_at
    };
  }

  // Create new clinical document
  static async create(data) {
    const {
      clinical_record_id, visit_id, filename, original_filename,
      file_path, file_type, file_size, mime_type, document_type,
      description, uploaded_by
    } = data;

    const queryText = `
      INSERT INTO clinical.clinical_documents (
        clinical_record_id, visit_id, filename, original_filename,
        file_path, file_type, file_size, mime_type, document_type,
        description, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      clinical_record_id, visit_id, filename, original_filename,
      file_path, file_type, file_size, mime_type, document_type,
      description, uploaded_by
    ];

    const result = await query(queryText, values);
    return new ClinicalDocument(result.rows[0]);
  }

  // Find document by ID
  static async findById(id) {
    const queryText = `
      SELECT cd.*, u.username as uploaded_by_username
      FROM clinical.clinical_documents cd
      LEFT JOIN auth.users u ON cd.uploaded_by = u.id
      WHERE cd.id = $1
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] ? new ClinicalDocument(result.rows[0]) : null;
  }

  // Find documents by clinical record ID
  static async findByClinicalRecordId(clinicalRecordId) {
    const queryText = `
      SELECT cd.*, u.username as uploaded_by_username
      FROM clinical.clinical_documents cd
      LEFT JOIN auth.users u ON cd.uploaded_by = u.id
      WHERE cd.clinical_record_id = $1
      ORDER BY cd.created_at DESC
    `;
    
    const result = await query(queryText, [clinicalRecordId]);
    return result.rows.map(row => new ClinicalDocument(row));
  }

  // Find documents by visit ID
  static async findByVisitId(visitId) {
    const queryText = `
      SELECT cd.*, u.username as uploaded_by_username
      FROM clinical.clinical_documents cd
      LEFT JOIN auth.users u ON cd.uploaded_by = u.id
      WHERE cd.visit_id = $1
      ORDER BY cd.created_at DESC
    `;
    
    const result = await query(queryText, [visitId]);
    return result.rows.map(row => new ClinicalDocument(row));
  }

  // Delete document
  static async delete(id) {
    const queryText = 'DELETE FROM clinical.clinical_documents WHERE id = $1';
    const result = await query(queryText, [id]);
    return result.rowCount > 0;
  }
}

module.exports = ClinicalDocument;
