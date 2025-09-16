const { query } = require('../database/connection');

class Patient {
  constructor(data) {
    this.id = data.id;
    this.codice_fiscale = data.codice_fiscale;
    this.numero_tessera_sanitaria = data.numero_tessera_sanitaria;
    this.nome = data.nome;
    this.cognome = data.cognome;
    this.data_nascita = data.data_nascita;
    this.luogo_nascita = data.luogo_nascita;
    this.sesso = data.sesso;
    this.indirizzo = data.indirizzo;
    this.citta = data.citta;
    this.cap = data.cap;
    this.provincia = data.provincia;
    this.telefono = data.telefono;
    this.email = data.email;
    this.anamnesi_medica = data.anamnesi_medica;
    this.consenso_trattamento_dati = data.consenso_trattamento_dati;
    this.note = data.note;
    this.medico_curante = data.medico_curante;
    this.sostanza_abuso = data.sostanza_abuso;
    this.abusi_secondari = data.abusi_secondari;
    this.professione = data.professione;
    this.stato_civile = data.stato_civile;
    this.is_active = data.is_active;
    this.created_by = data.created_by;
    this.created_by_username = data.created_by_username;
    this.medico_curante_username = data.medico_curante_username;
    this.medico_curante_first_name = data.medico_curante_first_name;
    this.medico_curante_last_name = data.medico_curante_last_name;
    this.medico_curante_role = data.medico_curante_role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new patient
  static async create(patientData) {
    const {
      codice_fiscale,
      numero_tessera_sanitaria,
      nome,
      cognome,
      data_nascita,
      luogo_nascita,
      sesso,
      indirizzo,
      citta,
      cap,
      provincia,
      telefono,
      email,
      anamnesi_medica,
      consenso_trattamento_dati,
      note,
      medico_curante,
      sostanza_abuso,
      abusi_secondari,
      professione,
      stato_civile,
      created_by
    } = patientData;
    
    const queryText = `
      INSERT INTO patient.patients (
        codice_fiscale, numero_tessera_sanitaria, nome, cognome, data_nascita,
        luogo_nascita, sesso, indirizzo, citta, cap, provincia, telefono, email,
        anamnesi_medica, consenso_trattamento_dati, note, medico_curante, 
        sostanza_abuso, abusi_secondari, professione, stato_civile, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
      RETURNING *
    `;
    
    const values = [
      codice_fiscale, numero_tessera_sanitaria, nome, cognome, data_nascita,
      luogo_nascita, sesso, indirizzo, citta, cap, provincia, telefono, email,
      anamnesi_medica, consenso_trattamento_dati, note, medico_curante, 
      sostanza_abuso, abusi_secondari, professione, stato_civile, created_by
    ];
    
    const result = await query(queryText, values);
    return new Patient(result.rows[0]);
  }

  // Find patient by ID
  static async findById(id) {
    const queryText = `
      SELECT p.*, u.username as created_by_username,
             mc.username as medico_curante_username,
             mc.first_name as medico_curante_first_name,
             mc.last_name as medico_curante_last_name,
             mr.name as medico_curante_role
      FROM patient.patients p
      LEFT JOIN auth.users u ON p.created_by = u.id
      LEFT JOIN auth.users mc ON p.medico_curante = mc.id
      LEFT JOIN auth.roles mr ON mc.role_id = mr.id
      WHERE p.id = $1
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }

  // Find patient by Codice Fiscale
  static async findByCodiceFiscale(codiceFiscale) {
    const queryText = `
      SELECT p.*, u.username as created_by_username
      FROM patient.patients p
      LEFT JOIN auth.users u ON p.created_by = u.id
      WHERE p.codice_fiscale = $1
    `;
    
    const result = await query(queryText, [codiceFiscale]);
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }

  // Find patient by Numero Tessera Sanitaria
  static async findByNumeroTesseraSanitaria(numeroTessera) {
    const queryText = `
      SELECT p.*, u.username as created_by_username
      FROM patient.patients p
      LEFT JOIN auth.users u ON p.created_by = u.id
      WHERE p.numero_tessera_sanitaria = $1
    `;
    
    const result = await query(queryText, [numeroTessera]);
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }

  // Search patients by name
  static async searchByName(searchTerm, limit = 10, offset = 0) {
    const queryText = `
      SELECT p.*, u.username as created_by_username
      FROM patient.patients p
      LEFT JOIN auth.users u ON p.created_by = u.id
      WHERE (p.nome ILIKE $1 OR p.cognome ILIKE $1 OR CONCAT(p.nome, ' ', p.cognome) ILIKE $1)
      ORDER BY p.cognome, p.nome
      LIMIT $2 OFFSET $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await query(queryText, [searchPattern, limit, offset]);
    return result.rows.map(row => new Patient(row));
  }

  // Get all patients with pagination
  static async findAll(limit = 10, offset = 0, filters = {}) {
    let queryText = `
      SELECT p.*, u.username as created_by_username, 
             mc.username as medico_curante_username,
             mc.first_name as medico_curante_first_name,
             mc.last_name as medico_curante_last_name,
             mr.name as medico_curante_role
      FROM patient.patients p
      LEFT JOIN auth.users u ON p.created_by = u.id
      LEFT JOIN auth.users mc ON p.medico_curante = mc.id
      LEFT JOIN auth.roles mr ON mc.role_id = mr.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Add filters
    if (filters.sesso) {
      queryText += ` AND p.sesso = $${paramCount}`;
      values.push(filters.sesso);
      paramCount++;
    }
    
    if (filters.citta) {
      queryText += ` AND p.citta ILIKE $${paramCount}`;
      values.push(`%${filters.citta}%`);
      paramCount++;
    }
    
    if (filters.data_nascita_da) {
      queryText += ` AND p.data_nascita >= $${paramCount}`;
      values.push(filters.data_nascita_da);
      paramCount++;
    }
    
    if (filters.data_nascita_a) {
      queryText += ` AND p.data_nascita <= $${paramCount}`;
      values.push(filters.data_nascita_a);
      paramCount++;
    }
    
    queryText += ` ORDER BY p.cognome, p.nome LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);
    
    const result = await query(queryText, values);
    return result.rows.map(row => new Patient(row));
  }

  // Count total patients
  static async count(filters = {}) {
    let queryText = `
      SELECT COUNT(*) as total
      FROM patient.patients p
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Add filters
    if (filters.sesso) {
      queryText += ` AND p.sesso = $${paramCount}`;
      values.push(filters.sesso);
      paramCount++;
    }
    
    if (filters.citta) {
      queryText += ` AND p.citta ILIKE $${paramCount}`;
      values.push(`%${filters.citta}%`);
      paramCount++;
    }
    
    if (filters.data_nascita_da) {
      queryText += ` AND p.data_nascita >= $${paramCount}`;
      values.push(filters.data_nascita_da);
      paramCount++;
    }
    
    if (filters.data_nascita_a) {
      queryText += ` AND p.data_nascita <= $${paramCount}`;
      values.push(filters.data_nascita_a);
      paramCount++;
    }
    
    const result = await query(queryText, values);
    return parseInt(result.rows[0].total);
  }

  // Get patient statistics
  static async getStatistics() {
    try {
      const queryText = `
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_patients,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_patients,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_patients,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_patients,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_patients
        FROM patient.patients
      `;
      
      const result = await query(queryText);
      const stats = result.rows[0];
      
      return {
        total_patients: parseInt(stats.total_patients),
        active_patients: parseInt(stats.active_patients),
        inactive_patients: parseInt(stats.inactive_patients),
        today_patients: parseInt(stats.today_patients),
        week_patients: parseInt(stats.week_patients),
        month_patients: parseInt(stats.month_patients)
      };
    } catch (error) {
      console.error('Error getting patient statistics:', error);
      throw error;
    }
  }

  // Update patient
  async update(updateData) {
    const allowedFields = [
      'codice_fiscale', 'numero_tessera_sanitaria', 'nome', 'cognome',
      'data_nascita', 'luogo_nascita', 'sesso', 'indirizzo', 'citta',
      'cap', 'provincia', 'telefono', 'email', 'anamnesi_medica',
      'consenso_trattamento_dati', 'note', 'medico_curante', 
      'sostanza_abuso', 'abusi_secondari', 'professione', 'stato_civile', 'is_active'
    ];
    
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
      UPDATE patient.patients 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    const updatedPatient = result.rows[0];
    
    // Update current instance
    Object.assign(this, updatedPatient);
    return this;
  }

  // Hard delete patient and all related data
  async delete() {
    const queryText = `
      DELETE FROM patient.patients 
      WHERE id = $1
    `;
    
    await query(queryText, [this.id]);
    // Patient and all related data (clinical records, visits, documents) are automatically deleted due to CASCADE constraints
    return this;
  }

  // Get patient data
  toJSON() {
    return {
      id: this.id,
      codice_fiscale: this.codice_fiscale,
      numero_tessera_sanitaria: this.numero_tessera_sanitaria,
      nome: this.nome,
      cognome: this.cognome,
      data_nascita: this.data_nascita,
      luogo_nascita: this.luogo_nascita,
      sesso: this.sesso,
      indirizzo: this.indirizzo,
      citta: this.citta,
      cap: this.cap,
      provincia: this.provincia,
      telefono: this.telefono,
      email: this.email,
      anamnesi_medica: this.anamnesi_medica,
      consenso_trattamento_dati: this.consenso_trattamento_dati,
      note: this.note,
      is_active: this.is_active,
      created_by: this.created_by,
      created_by_username: this.created_by_username,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Get statistics
  static async getStatistics() {
    const queryText = `
      SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_patients,
        COUNT(CASE WHEN sesso = 'M' THEN 1 END) as male_patients,
        COUNT(CASE WHEN sesso = 'F' THEN 1 END) as female_patients
      FROM patient.patients
      WHERE is_active = true
    `;
    
    const result = await query(queryText);
    const stats = result.rows[0];
    
    return {
      total_patients: parseInt(stats.total_patients) || 0,
      active_patients: parseInt(stats.active_patients) || 0,
      male_patients: parseInt(stats.male_patients) || 0,
      female_patients: parseInt(stats.female_patients) || 0
    };
  }

  // Get public patient data (without sensitive information)
  getPublicData() {
    return {
      id: this.id,
      codice_fiscale: this.codice_fiscale,
      numero_tessera_sanitaria: this.numero_tessera_sanitaria,
      nome: this.nome,
      cognome: this.cognome,
      data_nascita: this.data_nascita,
      luogo_nascita: this.luogo_nascita,
      sesso: this.sesso,
      indirizzo: this.indirizzo,
      citta: this.citta,
      cap: this.cap,
      provincia: this.provincia,
      telefono: this.telefono,
      email: this.email,
      anamnesi_medica: this.anamnesi_medica,
      consenso_trattamento_dati: this.consenso_trattamento_dati,
      note: this.note,
      medico_curante: this.medico_curante,
      medico_curante_username: this.medico_curante_username,
      medico_curante_first_name: this.medico_curante_first_name,
      medico_curante_last_name: this.medico_curante_last_name,
      medico_curante_role: this.medico_curante_role,
      sostanza_abuso: this.sostanza_abuso,
      abusi_secondari: this.abusi_secondari,
      professione: this.professione,
      stato_civile: this.stato_civile,
      is_active: this.is_active,
      created_by_username: this.created_by_username,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Patient;
