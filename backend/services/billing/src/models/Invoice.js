const { query } = require('../utils/database');
const moment = require('moment');

class Invoice {
  constructor(data) {
    this.id = data.id;
    this.invoice_number = data.invoice_number;
    this.patient_id = data.patient_id;
    this.patient_name = data.patient_name;
    this.patient_cf = data.patient_cf;
    this.description = data.description;
    this.amount = data.amount;
    this.payment_method = data.payment_method;
    this.status = data.status;
    this.issue_date = data.issue_date;
    this.due_date = data.due_date;
    this.payment_date = data.payment_date;
    this.payment_notes = data.payment_notes;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Generate next invoice number based on current year
  static async generateInvoiceNumber() {
    const year = moment().format('YYYY');
    const result = await query(
      `SELECT invoice_number 
       FROM billing.invoices 
       WHERE invoice_number LIKE $1
       ORDER BY invoice_number DESC
       LIMIT 1`,
      [`INV-${year}-%`]
    );
    
    let nextNum = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].invoice_number;
      const numberPart = lastNumber.split('-')[2];
      nextNum = parseInt(numberPart, 10) + 1;
    }
    
    return `INV-${year}-${nextNum.toString().padStart(3, '0')}`;
  }

  // Create new invoice following brief requirements
  static async create(invoiceData, createdBy) {
    try {
      // Get patient information for the invoice
      const patientResult = await query(
        'SELECT nome, cognome, codice_fiscale FROM patient.patients WHERE id = $1',
        [invoiceData.patient_id]
      );
      
      if (patientResult.rows.length === 0) {
        throw new Error('Paziente non trovato');
      }
      
      const patient = patientResult.rows[0];
      const patientName = `${patient.nome} ${patient.cognome}`;
      
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Calculate due date (default 30 days from issue)
      const dueDays = invoiceData.due_days || 30;
      const issueDate = invoiceData.issue_date || new Date();
      const dueDate = moment(issueDate).add(dueDays, 'days').toDate();
      
      const queryText = `
        INSERT INTO billing.invoices (
          invoice_number, patient_id, patient_name, patient_cf,
          description, amount, payment_method, issue_date, due_date, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [
        invoiceNumber,
        invoiceData.patient_id,
        patientName,
        patient.codice_fiscale,
        invoiceData.description,
        invoiceData.amount,
        invoiceData.payment_method || 'contanti',
        issueDate,
        dueDate,
        createdBy
      ];
      
      const result = await query(queryText, values);
      return new Invoice(result.rows[0]);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Get all invoices with filters (following brief requirements)
  static async findAll(filters = {}) {
    let queryText = `
      SELECT i.*, 
             p.nome || ' ' || p.cognome as patient_full_name,
             u.username as created_by_username
      FROM billing.invoices i
      LEFT JOIN patient.patients p ON i.patient_id = p.id
      LEFT JOIN auth.users u ON i.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Filter by patient (name or CF)
    if (filters.patient) {
      queryText += ` AND (
        LOWER(i.patient_name) LIKE LOWER($${paramCount}) OR 
        LOWER(i.patient_cf) LIKE LOWER($${paramCount}) OR
        LOWER(i.invoice_number) LIKE LOWER($${paramCount})
      )`;
      queryParams.push(`%${filters.patient}%`);
      paramCount++;
    }
    
    // Filter by status
    if (filters.status) {
      queryText += ` AND i.status = $${paramCount}`;
      queryParams.push(filters.status);
      paramCount++;
    }
    
    // Filter by date range
    if (filters.start_date) {
      queryText += ` AND i.issue_date >= $${paramCount}`;
      queryParams.push(filters.start_date);
      paramCount++;
    }
    
    if (filters.end_date) {
      queryText += ` AND i.issue_date <= $${paramCount}`;
      queryParams.push(filters.end_date);
      paramCount++;
    }
    
    // Order by issue date (newest first)
    queryText += ' ORDER BY i.issue_date DESC, i.id DESC';
    
    // Pagination
    if (filters.limit) {
      queryText += ` LIMIT $${paramCount}`;
      queryParams.push(filters.limit);
      paramCount++;
    }
    
    if (filters.offset) {
      queryText += ` OFFSET $${paramCount}`;
      queryParams.push(filters.offset);
    }
    
    const result = await query(queryText, queryParams);
    return result.rows.map(row => new Invoice(row));
  }

  // Get invoice by ID
  static async findById(id) {
    const result = await query(
      `SELECT i.*, 
              p.nome || ' ' || p.cognome as patient_full_name,
              u.username as created_by_username
       FROM billing.invoices i
       LEFT JOIN patient.patients p ON i.patient_id = p.id
       LEFT JOIN auth.users u ON i.created_by = u.id
       WHERE i.id = $1`,
      [id]
    );
    
    return result.rows.length > 0 ? new Invoice(result.rows[0]) : null;
  }

  // Update invoice status (following brief requirements)
  static async updateStatus(id, status, updatedBy, paymentDate = null, notes = null) {
    try {
      const queryText = `
        UPDATE billing.invoices 
        SET status = $1, 
            payment_date = $2,
            payment_notes = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      
      const values = [
        status,
        status === 'paid' ? (paymentDate || new Date()) : null,
        notes,
        id
      ];
      
      const result = await query(queryText, values);
      
      if (result.rows.length === 0) {
        throw new Error('Fattura non trovata');
      }
      
      return new Invoice(result.rows[0]);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  // Update invoice
  static async update(id, invoiceData, updatedBy) {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findById(id);
      if (!existingInvoice) {
        throw new Error('Fattura non trovata');
      }

      // Get patient information if patient_id has changed
      let patientName = existingInvoice.patient_name;
      let patientCF = existingInvoice.patient_cf;
      
      if (invoiceData.patient_id !== existingInvoice.patient_id) {
        const patientResult = await query(
          'SELECT nome, cognome, codice_fiscale FROM patient.patients WHERE id = $1',
          [invoiceData.patient_id]
        );
        
        if (patientResult.rows.length === 0) {
          throw new Error('Paziente non trovato');
        }
        
        const patient = patientResult.rows[0];
        patientName = `${patient.nome} ${patient.cognome}`;
        patientCF = patient.codice_fiscale;
      }

      // Calculate due date if changed
      const dueDays = invoiceData.due_days || 30;
      const issueDate = invoiceData.issue_date || existingInvoice.issue_date;
      const dueDate = moment(issueDate).add(dueDays, 'days').toDate();

      const queryText = `
        UPDATE billing.invoices 
        SET patient_id = $1,
            patient_name = $2,
            patient_cf = $3,
            description = $4,
            amount = $5,
            payment_method = $6,
            issue_date = $7,
            due_date = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;
      
      const values = [
        invoiceData.patient_id,
        patientName,
        patientCF,
        invoiceData.description,
        invoiceData.amount,
        invoiceData.payment_method || 'contanti',
        issueDate,
        dueDate,
        id
      ];
      
      const result = await query(queryText, values);
      
      if (result.rows.length === 0) {
        throw new Error('Fattura non trovata');
      }
      
      return new Invoice(result.rows[0]);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // Delete invoice
  static async delete(id) {
    const result = await query(
      'DELETE FROM billing.invoices WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows.length > 0;
  }

  // Get invoice statistics
  static async getStatistics(filters = {}) {
    let queryText = `
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending_amount,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue_amount,
        COALESCE(SUM(amount), 0) as total_amount
      FROM billing.invoices 
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Apply date filters if provided
    if (filters.start_date) {
      queryText += ` AND issue_date >= $${paramCount}`;
      queryParams.push(filters.start_date);
      paramCount++;
    }
    
    if (filters.end_date) {
      queryText += ` AND issue_date <= $${paramCount}`;
      queryParams.push(filters.end_date);
    }
    
    const result = await query(queryText, queryParams);
    return result.rows[0];
  }

  // Check and update overdue invoices
  static async updateOverdueInvoices() {
    const result = await query(`
      UPDATE billing.invoices 
      SET status = 'overdue' 
      WHERE status = 'pending' 
        AND due_date < CURRENT_DATE
      RETURNING id, invoice_number
    `);
    
    return result.rows;
  }

  // Get company settings for PDF generation
  static async getCompanySettings() {
    const result = await query(`
      SELECT setting_key, setting_value 
      FROM billing.billing_settings 
      WHERE setting_key IN ('company_name', 'company_address', 'company_vat', 'company_cf')
    `);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  }
}

module.exports = Invoice;