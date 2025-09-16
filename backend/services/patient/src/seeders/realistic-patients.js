/**
 * Realistic Patient Data Seeder for Addiction Recovery Foundation
 * 
 * This file contains realistic patient data specifically tailored for
 * a psychological assistance foundation dealing with addiction recovery.
 * 
 * Data is anonymized and based on common addiction recovery patterns.
 */

const { Patient } = require('../models');

const realisticPatients = [
  // Alcohol Addiction Recovery Patients
  {
    nome: 'Marco',
    cognome: 'Rossi',
    data_nascita: new Date('1985-03-15'),
    codice_fiscale: 'RSSMRC85C15H501X',
    sesso: 'M',
    telefono: '3311234567',
    email: 'marco.r@email.com',
    indirizzo: 'Via Roma 123, Milano',
    status: 'active',
    note: 'Paziente in trattamento per dipendenza da alcol. Motivazione alta, supporto familiare presente.'
  },
  {
    nome: 'Giulia',
    cognome: 'Bianchi',
    data_nascita: new Date('1992-07-22'),
    codice_fiscale: 'BNCGLI92L62F205Y',
    sesso: 'F',
    telefono: '3322345678',
    email: 'giulia.bianchi@email.com',
    indirizzo: 'Corso Venezia 45, Milano',
    status: 'active',
    note: 'Dipendenza da alcol con episodi di binge drinking. Frequenta gruppo AA.'
  },
  {
    nome: 'Alessandro',
    cognome: 'Verdi',
    data_nascita: new Date('1978-11-08'),
    codice_fiscale: 'VRDLSN78S08L219K',
    sesso: 'M',
    telefono: '3333456789',
    email: 'a.verdi@email.com',
    indirizzo: 'Piazza Duomo 12, Milano',
    status: 'active',
    note: 'Dipendenza da alcol e co-dipendenza da benzodiazepine. Supporto farmacologico.'
  },

  // Drug Addiction Recovery Patients
  {
    nome: 'Francesca',
    cognome: 'Ferrari',
    data_nascita: new Date('1990-05-03'),
    codice_fiscale: 'FRRFNC90E43D612M',
    sesso: 'F',
    telefono: '3344567890',
    email: 'francesca.f@email.com',
    indirizzo: 'Via Garibaldi 67, Milano',
    status: 'active',
    note: 'Ex dipendenza da cocaina. In mantenimento con supporto psicologico intensivo.'
  },
  {
    nome: 'Roberto',
    cognome: 'Conti',
    data_nascita: new Date('1987-09-14'),
    codice_fiscale: 'CNTRRT87P14F839Z',
    sesso: 'M',
    telefono: '3355678901',
    email: 'roberto.conti@email.com',
    indirizzo: 'Viale Monza 234, Milano',
    status: 'active',
    note: 'Dipendenza da eroina. Terapia sostitutiva con metadone e supporto psicosociale.'
  },
  {
    nome: 'Elena',
    cognome: 'Marino',
    data_nascita: new Date('1995-01-27'),
    codice_fiscale: 'MRNLEN95A67E205K',
    sesso: 'F',
    telefono: '3366789012',
    email: 'elena.marino@email.com',
    indirizzo: 'Via Brera 18, Milano',
    status: 'active',
    note: 'Dipendenza da MDMA e cannabis. Prima volta in trattamento, buona collaborazione.'
  },

  // Mixed Addictions (alcol + droghe only)
  {
    nome: 'Davide',
    cognome: 'Ricci',
    data_nascita: new Date('1975-08-30'),
    codice_fiscale: 'RCCDVD75M30H501L',
    sesso: 'M',
    telefono: '3399012345',
    email: 'davide.ricci@email.com',
    indirizzo: 'Via Torino 89, Milano',
    status: 'active',
    note: 'Poli-dipendenze: alcol e cocaina. Storia di ricadute multiple. Supporto intensivo.'
  },
  {
    nome: 'Chiara',
    cognome: 'Esposito',
    data_nascita: new Date('1991-06-18'),
    codice_fiscale: 'SPSCHR91H58F839A',
    sesso: 'F',
    telefono: '3410123456',
    email: 'chiara.esposito@email.com',
    indirizzo: 'Via Navigli 23, Milano',
    status: 'active',
    note: 'Dipendenza da alcol con disturbi dell\'alimentazione. Approccio multidisciplinare.'
  },

  // Current active treatments
  {
    nome: 'Sara',
    cognome: 'Moretti',
    data_nascita: new Date('1986-07-14'),
    codice_fiscale: 'MRTSAR86L54F205D',
    sesso: 'F',
    telefono: '3454567890',
    email: 'sara.moretti@email.com',
    indirizzo: 'Viale Certosa 234, Milano',
    status: 'active',
    note: 'Dipendenza da benzodiazepine. Detox completato, fase di mantenimento.'
  },

  // Young Adult Patients
  {
    nome: 'Tommaso',
    cognome: 'Giuliani',
    data_nascita: new Date('1998-12-22'),
    codice_fiscale: 'GLTMMS98T22F205F',
    sesso: 'M',
    telefono: '3465678901',
    email: 'tommaso.g@email.com',
    indirizzo: 'Via Isola 45, Milano',
    status: 'active',
    note: 'Giovane adulto con dipendenza da cannabis e sostanze sintetiche. Supporto familiare.'
  },
  {
    nome: 'Martina',
    cognome: 'Pellegrini',
    data_nascita: new Date('1999-04-08'),
    codice_fiscale: 'PLLMTN99D48F205G',
    sesso: 'F',
    telefono: '3476789012',
    email: 'martina.pellegrini@email.com',
    indirizzo: 'Corso Porta Romana 78, Milano',
    status: 'active',
    note: 'Prima esperienza terapeutica. Uso problematico di alcol e cannabis.'
  }
];

/**
 * Seeds the database with realistic patient data for addiction recovery
 */
const seedRealisticPatients = async () => {
  try {
    console.log('🌱 Starting realistic patient data seeding...');
    
    // Clear existing patients (optional - uncomment if needed)
    // await Patient.destroy({ where: {}, force: true });
    
    const createdPatients = [];
    
    for (const patientData of realisticPatients) {
      // Check if patient already exists
      const existingPatient = await Patient.findByCodiceFiscale(patientData.codice_fiscale);
      
      if (!existingPatient) {
        const patient = await Patient.create(patientData);
        createdPatients.push(patient);
        console.log(`✅ Created patient: ${patient.nome} ${patient.cognome}`);
      } else {
        console.log(`⚠️  Patient already exists: ${patientData.nome} ${patientData.cognome}`);
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdPatients.length} patients (alcohol and drug addictions only)`);
    return createdPatients;
    
  } catch (error) {
    console.error('❌ Error seeding realistic patient data:', error);
    throw error;
  }
};

module.exports = {
  realisticPatients,
  seedRealisticPatients
};