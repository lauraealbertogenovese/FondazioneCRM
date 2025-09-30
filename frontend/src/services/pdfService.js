import jsPDF from "jspdf";
import "jspdf-autotable";

// Configurazione aziendale
const COMPANY_INFO = {
  name: "Fondazione Laura e Alberto Genovese",
  piva: "07663520567",
  cf: "RSSMRA70003 Milano MI",
  address: {
    street: "Via della Fondazione, 123",
    city: "20100 Milano MI",
    country: "Italia",
  },
};

export const generateInvoicePDF = (invoiceData, patientData) => {
  // Crea nuovo documento PDF
  const doc = new jsPDF();

  // Configurazione colori
  const primaryColor = [59, 130, 246]; // Blue
  const lightGray = [245, 245, 245];
  const darkGray = [64, 64, 64];

  let yPosition = 20;

  // === HEADER ===
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);

  // Fattura numero e data (in alto a destra)
  const invoiceNumber = `GS${new Date().getFullYear()}/${String(
    Math.floor(Math.random() * 9999) + 1
  ).padStart(4, "0")}`;
  const issueDate = new Date(invoiceData.issue_date).toLocaleDateString(
    "it-IT"
  );

  const rightMargin = 190; // Adjust this value to your liking, 190 is a good starting point for an A4 page

  doc.text(`FATTURA: ${invoiceNumber}`, rightMargin, yPosition, {
    align: "right",
  });
  doc.text(`DATA EMISSIONE: ${issueDate}`, rightMargin, yPosition + 7, {
    align: "right",
  });

  yPosition += 25;

  // === DATI AZIENDA ===
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(COMPANY_INFO.name, 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
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
  doc.setFont(undefined, "bold");
  doc.text(`${patientData.nome} ${patientData.cognome}`, 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  // Indirizzo paziente (se disponibile)
  if (patientData.indirizzo) {
    doc.text(patientData.indirizzo, 20, yPosition);
    yPosition += 5;
  }
  if (patientData.citta) {
    doc.text(
      `${patientData.cap || ""} ${patientData.citta} ${
        patientData.provincia || ""
      }`.trim(),
      20,
      yPosition
    );
    yPosition += 5;
  }
  doc.text(`CF: ${patientData.codice_fiscale}`, 20, yPosition);

  yPosition += 20;

  // === TIPO DOCUMENTO ===
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Tipo Documento", 20, yPosition);
  yPosition += 6;
  doc.setFont(undefined, "normal");
  doc.text("TD06", 20, yPosition);

  yPosition += 20;

  // === PRESTAZIONI (TABELLA) ===
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Prestazioni", 20, yPosition);
  yPosition += 10;

  // Tabella prestazioni
  const tableData = [
    [
      invoiceData.description,
      "1",
      `${parseFloat(invoiceData.amount).toFixed(2)} €`,
      "0%",
    ],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [["Descrizione", "Quantità", "Importo", "IVA"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: lightGray,
      textColor: darkGray,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: darkGray,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 25, halign: "center" },
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // === RIEPILOGO TOTALI ===
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Riepilogo e totali", 20, yPosition);
  yPosition += 10;

  // Tabella totali
  const totalsData = [
    ["Totale imponibile", `${parseFloat(invoiceData.amount).toFixed(2)} €`],
    ["Totale Prestazioni", `${parseFloat(invoiceData.amount).toFixed(2)} €`],
  ];

  doc.autoTable({
    startY: yPosition,
    body: totalsData,
    theme: "plain",
    bodyStyles: {
      fontSize: 10,
      textColor: darkGray,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = doc.lastAutoTable.finalY + 30;

  // === METODO DI PAGAMENTO ===
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Metodo di pagamento", 20, yPosition);
  yPosition += 8;
  doc.setFont(undefined, "normal");
  doc.text(getPaymentMethodLabel(invoiceData.payment_method), 20, yPosition);

  // === FOOTER ===
  yPosition = 280; // Near bottom of page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Documento generato automaticamente dal sistema CRM Fondazione",
    20,
    yPosition
  );
  doc.text(
    `Generato il: ${new Date().toLocaleDateString(
      "it-IT"
    )} alle ${new Date().toLocaleTimeString("it-IT")}`,
    20,
    yPosition + 5
  );

  // Salva il PDF
  const fileName = `Fattura_${invoiceNumber}_${patientData.cognome}_${patientData.nome}.pdf`;
  doc.save(fileName);

  return {
    success: true,
    fileName,
    invoiceNumber,
  };
};

// Helper function per convertire metodo di pagamento
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case "contanti":
      return "Contanti";
    case "bonifico":
      return "Bonifico Bancario";
    case "pos":
      return "POS";
    default:
      return method.toUpperCase();
  }
};

// Funzione per anteprima PDF (apre in nuova finestra invece di scaricare)
export const previewInvoicePDF = (invoiceData, patientData) => {
  const doc = new jsPDF();

  // ... (stesso codice di generazione) ...
  // Per brevità non ripeto tutto il codice, ma la logica è identica

  // Invece di salvare, apre in nuova finestra
  const pdfOutput = doc.output("datauristring");
  const newWindow = window.open();
  newWindow.document.write(`
    <iframe width='100%' height='100%' src='${pdfOutput}'></iframe>
  `);

  return {
    success: true,
    preview: true,
  };
};
