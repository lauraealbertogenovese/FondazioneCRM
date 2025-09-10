// Temporary simplified PDF generator without Puppeteer
// TODO: Re-implement with proper PDF library
const moment = require('moment');

// Generate invoice PDF (simplified version without Puppeteer)
const generateInvoicePDF = async (invoice, companySettings = {}) => {
  try {
    // For now, return a simple text-based "PDF" as buffer
    // In production, use a proper PDF library like PDFKit or jsPDF
    const invoiceText = `
FATTURA N. ${invoice.invoice_number}
Data: ${moment(invoice.issue_date).format('DD/MM/YYYY')}
Scadenza: ${moment(invoice.due_date).format('DD/MM/YYYY')}
Paziente: ${invoice.patient_name}
Codice Fiscale: ${invoice.patient_cf}
Importo: €${invoice.amount}
Stato: ${getStatusText(invoice.status)}

Azienda: ${companySettings?.company_name || 'Fondazione CRM'}
${companySettings?.company_address || 'Via Roma 123, 00100 Roma'}
P.IVA: ${companySettings?.company_vat || 'IT12345678901'}
`;
    
    // Convert to buffer (simulating PDF)
    return Buffer.from(invoiceText, 'utf8');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate HTML content for the invoice
const generateInvoiceHTML = (invoice, companySettings) => {
  const {
    company_name = 'Fondazione CRM',
    company_address = 'Via Roma 123, 00100 Roma',
    company_vat = 'IT12345678901',
    company_cf = 'ABCDEF12G34H567I'
  } = companySettings;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fattura ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.4;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2196F3;
          padding-bottom: 20px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #2196F3;
          margin-bottom: 10px;
        }
        
        .company-details {
          font-size: 14px;
          color: #666;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #2196F3;
        }
        
        .invoice-dates {
          text-align: right;
        }
        
        .patient-info {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .patient-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #2196F3;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
        }
        
        .details-table th {
          background: #2196F3;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        
        .details-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .amount-row {
          font-weight: bold;
          background: #f8f9fa;
        }
        
        .total-section {
          text-align: right;
          margin-top: 20px;
        }
        
        .total-amount {
          font-size: 20px;
          font-weight: bold;
          color: #2196F3;
          border: 2px solid #2196F3;
          padding: 15px;
          display: inline-block;
          border-radius: 8px;
        }
        
        .payment-info {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        
        .status-paid {
          background: #d4edda;
          color: #155724;
        }
        
        .status-overdue {
          background: #f8d7da;
          color: #721c24;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${company_name}</div>
        <div class="company-details">
          ${company_address}<br>
          P.IVA: ${company_vat} | C.F.: ${company_cf}
        </div>
      </div>
      
      <div class="invoice-info">
        <div>
          <div class="invoice-number">FATTURA ${invoice.invoice_number}</div>
          <div class="status-badge status-${invoice.status}">
            ${getStatusText(invoice.status)}
          </div>
        </div>
        <div class="invoice-dates">
          <div><strong>Data Emissione:</strong> ${formatDate(invoice.issue_date)}</div>
          <div><strong>Data Scadenza:</strong> ${formatDate(invoice.due_date)}</div>
          ${invoice.payment_date ? `<div><strong>Data Pagamento:</strong> ${formatDate(invoice.payment_date)}</div>` : ''}
        </div>
      </div>
      
      <div class="patient-info">
        <div class="patient-title">FATTURATO A:</div>
        <div><strong>Nome:</strong> ${invoice.patient_name}</div>
        <div><strong>Codice Fiscale:</strong> ${invoice.patient_cf}</div>
      </div>
      
      <table class="details-table">
        <thead>
          <tr>
            <th>Descrizione Servizio/Trattamento</th>
            <th>Modalità Pagamento</th>
            <th style="text-align: right">Importo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.description}</td>
            <td>${getPaymentMethodText(invoice.payment_method)}</td>
            <td style="text-align: right">${formatCurrency(invoice.amount)}</td>
          </tr>
          <tr class="amount-row">
            <td colspan="2"><strong>TOTALE</strong></td>
            <td style="text-align: right"><strong>${formatCurrency(invoice.amount)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-amount">
          TOTALE DA PAGARE: ${formatCurrency(invoice.amount)}
        </div>
      </div>
      
      ${invoice.payment_notes ? `
        <div class="payment-info">
          <strong>Note Pagamento:</strong><br>
          ${invoice.payment_notes}
        </div>
      ` : ''}
      
      <div class="footer">
        Documento generato automaticamente il ${formatDate(new Date())}
      </div>
    </body>
    </html>
  `;
};

// Get payment method display text
const getPaymentMethodText = (method) => {
  const methods = {
    'contanti': 'Contanti',
    'tracciabile': 'Pagamento Tracciabile'
  };
  return methods[method] || method;
};

// Get status display text
const getStatusText = (status) => {
  const statuses = {
    'pending': 'In Attesa',
    'paid': 'Pagato',
    'overdue': 'Scaduto',
    'cancelled': 'Annullato'
  };
  return statuses[status] || status;
};

module.exports = {
  generateInvoicePDF
};