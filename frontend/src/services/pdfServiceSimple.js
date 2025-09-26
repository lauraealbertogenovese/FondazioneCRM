import jsPDF from 'jspdf';

// Configurazione aziendale
const COMPANY_INFO = {
  name: 'Fondazione Laura e Alberto Genovese ETS – RUNTS 58162',
  piva: '97932880152',
  cf: '97932880152',
  address: {
    street: 'via Santo Stefano 16',
    city: 'Napoli',
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
  const invoiceNumber = invoiceData.invoice_number || `TEMP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
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
  doc.text(`P.IVA e CF: ${COMPANY_INFO.piva}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Sede legale e Direzione: ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}`, 20, yPosition);
  
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
  
  // === PRESTAZIONI (SEMPLICE) ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Prestazioni', 20, yPosition);
  yPosition += 10;

  // Header tabella manuale (senza colonna IVA)
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Descrizione', 20, yPosition);
  doc.text('Quantità', 110, yPosition);
  doc.text('Importo', 150, yPosition);

  yPosition += 7;

  // Linea separatrice
  doc.line(20, yPosition, 180, yPosition);
  yPosition += 5;

  // Riga principale - Servizio/Trattamento
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.description, 20, yPosition);
  doc.text('1', 110, yPosition);
  doc.text(`${parseFloat(invoiceData.amount).toFixed(2)} €`, 150, yPosition);

  yPosition += 7;

  // Riga imposta di bollo (se applicata)
  if (invoiceData.stamp_duty_applied && parseFloat(invoiceData.stamp_duty_amount) > 0) {
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.text('Imposta di bollo', 20, yPosition);
    doc.text('1', 110, yPosition);
    doc.text(`${parseFloat(invoiceData.stamp_duty_amount).toFixed(2)} €`, 150, yPosition);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPosition += 7;
  }

  yPosition += 3;

  // Linea separatrice
  doc.line(20, yPosition, 180, yPosition);
  yPosition += 10;

  // Frase esenzione IVA
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.text('Prestazione esente iva ex art. 10, comma 1, n. 18 D.P.R. 633/72', 20, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
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

  // Riga imposta di bollo nel riepilogo (se applicata)
  if (invoiceData.stamp_duty_applied && parseFloat(invoiceData.stamp_duty_amount) > 0) {
    doc.text('Imposta di bollo', 20, yPosition);
    doc.text(`${parseFloat(invoiceData.stamp_duty_amount).toFixed(2)} €`, 120, yPosition);
    yPosition += 7;
  }

  doc.setFont(undefined, 'bold');
  const totalAmount = parseFloat(invoiceData.total_amount) || parseFloat(invoiceData.amount);
  doc.text('TOTALE FATTURA', 20, yPosition);
  doc.text(`${totalAmount.toFixed(2)} €`, 120, yPosition);
  
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
    case 'tracciabile':
      return 'Modalità Tracciabile';
    default:
      return method.toUpperCase();
  }
};
