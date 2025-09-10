import jsPDF from 'jspdf';

// Configurazione aziendale
const COMPANY_INFO = {
  name: 'Fondazione Laura e Alberto Genovese',
  piva: '07663520567',
  cf: 'RSSMRA70003 Milano MI',
  address: {
    street: 'Via della Fondazione, 123',
    city: '20100 Milano MI',
    country: 'Italia'
  }
};

export const generateInvoicePDF = (invoiceData, patientData) => {
  // Crea nuovo documento PDF
  const doc = new jsPDF();
  
  let yPosition = 20;
  
  // === HEADER ===
  doc.setFontSize(12);
  
  // Fattura numero e data (in alto a destra)
  const invoiceNumber = `GS${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
  const issueDate = new Date(invoiceData.issue_date).toLocaleDateString('it-IT');
  
  doc.text(`FATTURA: ${invoiceNumber}`, 150, yPosition);
  doc.text(`DATA EMISSIONE: ${issueDate}`, 150, yPosition + 7);
  
  yPosition += 25;
  
  // === DATI AZIENDA ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(COMPANY_INFO.name, 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`P.IVA: ${COMPANY_INFO.piva}`, 20, yPosition);
  yPosition += 5;
  doc.text(`CF: ${COMPANY_INFO.cf}`, 20, yPosition);
  yPosition += 5;
  doc.text(COMPANY_INFO.address.street, 20, yPosition);
  yPosition += 5;
  doc.text(COMPANY_INFO.address.city, 20, yPosition);
  
  yPosition += 20;
  
  // === DATI CLIENTE ===
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`${patientData.nome} ${patientData.cognome}`, 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // Indirizzo paziente (se disponibile)
  if (patientData.indirizzo) {
    doc.text(patientData.indirizzo, 20, yPosition);
    yPosition += 5;
  }
  if (patientData.citta) {
    doc.text(`${patientData.cap || ''} ${patientData.citta} ${patientData.provincia || ''}`.trim(), 20, yPosition);
    yPosition += 5;
  }
  doc.text(`CF: ${patientData.codice_fiscale}`, 20, yPosition);
  
  yPosition += 20;
  
  // === TIPO DOCUMENTO ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Tipo Documento', 20, yPosition);
  yPosition += 6;
  doc.setFont(undefined, 'normal');
  doc.text('TD06', 20, yPosition);
  
  yPosition += 20;
  
  // === PRESTAZIONI (SEMPLICE) ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Prestazioni', 20, yPosition);
  yPosition += 10;
  
  // Header tabella manuale
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Descrizione', 20, yPosition);
  doc.text('Quantità', 90, yPosition);
  doc.text('Importo', 120, yPosition);
  doc.text('IVA', 150, yPosition);
  
  yPosition += 7;
  
  // Linea separatrice
  doc.line(20, yPosition, 180, yPosition);
  yPosition += 5;
  
  // Dati tabella
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.description, 20, yPosition);
  doc.text('1', 90, yPosition);
  doc.text(`${parseFloat(invoiceData.amount).toFixed(2)} €`, 120, yPosition);
  doc.text('0%', 150, yPosition);
  
  yPosition += 10;
  
  // Linea separatrice
  doc.line(20, yPosition, 180, yPosition);
  yPosition += 15;
  
  // === RIEPILOGO TOTALI ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Riepilogo e totali', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Totale imponibile', 20, yPosition);
  doc.text(`${parseFloat(invoiceData.amount).toFixed(2)} €`, 120, yPosition);
  yPosition += 7;
  
  doc.setFont(undefined, 'bold');
  doc.text('Totale Prestazioni', 20, yPosition);
  doc.text(`${parseFloat(invoiceData.amount).toFixed(2)} €`, 120, yPosition);
  
  yPosition += 30;
  
  // === METODO DI PAGAMENTO ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Metodo di pagamento', 20, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.text(getPaymentMethodLabel(invoiceData.payment_method), 20, yPosition);
  
  // === FOOTER ===
  yPosition = 280; // Near bottom of page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Documento generato automaticamente dal sistema CRM Fondazione', 20, yPosition);
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`, 20, yPosition + 5);
  
  // Salva il PDF
  const fileName = `Fattura_${invoiceNumber}_${patientData.cognome}_${patientData.nome}.pdf`;
  doc.save(fileName);
  
  return {
    success: true,
    fileName,
    invoiceNumber
  };
};

// Helper function per convertire metodo di pagamento
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'contanti':
      return 'Contanti';
    case 'bonifico':
      return 'Bonifico Bancario';
    case 'pos':
      return 'POS';
    default:
      return method.toUpperCase();
  }
};
