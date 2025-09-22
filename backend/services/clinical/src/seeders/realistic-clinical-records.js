/**
 * Realistic Clinical Records Data Seeder for Addiction Recovery Foundation
 * 
 * This file contains realistic clinical records data specifically tailored for
 * addiction recovery treatment, including appropriate diagnoses and treatment plans.
 */

const { ClinicalRecord } = require('../models');

const addictionDiagnoses = [
  // Alcohol-related disorders
  'F10.20 - Disturbi correlati all\'alcol, dipendenza, non specificata',
  'F10.21 - Disturbi correlati all\'alcol, dipendenza, in remissione precoce',
  'F10.10 - Disturbi correlati all\'alcol, uso lieve',
  'F10.11 - Disturbi correlati all\'alcol, uso moderato',
  
  // Substance-related disorders
  'F11.20 - Disturbi correlati agli oppioidi, dipendenza',
  'F14.20 - Disturbi correlati alla cocaina, dipendenza',
  'F12.20 - Disturbi correlati alla cannabis, dipendenza',
  'F15.20 - Disturbi correlati agli stimolanti, dipendenza',
  'F13.20 - Disturbi correlati ai sedativi/ipnotici, dipendenza',
  
  // Gambling and behavioral addictions
  'F63.0 - Gioco d\'azzardo patologico',
  'F63.2 - Cleptomania',
  'F63.1 - Piromania',
  
  // Comorbid conditions common in addiction
  'F32.1 - Episodio depressivo maggiore, moderato',
  'F41.1 - Disturbo d\'ansia generalizzata',
  'F43.1 - Disturbo post-traumatico da stress',
  'F60.31 - Disturbo borderline di personalità'
];

const treatmentPlans = [
  // Alcohol treatment plans
  'Programma di disintossicazione ambulatoriale, terapia cognitivo-comportamentale, partecipazione gruppo AA, supporto farmacologico con naltrexone',
  'Detox residenziale breve, terapia individuale CBT, terapia familiare, programma di prevenzione ricadute',
  'Mantenimento sobrietà con supporto psicologico settimanale, gruppo di auto-aiuto, monitoraggio medico',
  
  // Drug treatment plans  
  'Terapia sostitutiva con metadone, counseling individuale, supporto psicosociale, reinserimento lavorativo',
  'Programma therapeutic community, terapia di gruppo, skills training, preparazione dimissioni protette',
  'Disintossicazione da cocaina, terapia motivazionale, gestione craving, supporto sociale',
  
  // Gambling treatment plans
  'Terapia cognitivo-comportamentale per gioco patologico, gestione debiti, supporto familiare',
  'Programma ambulatoriale intensivo, auto-esclusione case da gioco, ricostruzione relazioni',
  
  // Comorbidity treatment plans
  'Trattamento integrato dipendenza-depressione, farmacoterapia con SSRI, psicoterapia',
  'Approccio trauma-informed per PTSD e dipendenze, EMDR, stabilizzazione emotiva',
  'DBT per disturbo borderline e dipendenze multiple, skills regulation, mindfulness'
];

const clinicalNotes = [
  // Progress notes
  'Paziente mostra buona compliance al trattamento. Riduzione significativa del craving. Mantiene astinenza da 45 giorni. Migliorate relazioni familiari.',
  'Episodio di ricaduta la scorsa settimana. Elaborato in seduta. Rivisto piano terapeutico. Aumentato supporto psicologico a 2 volte/settimana.',
  'Completata fase di disintossicazione. Sintomi astinenziali risolti. Inizia fase riabilitativa. Motivazione alta.',
  'Paziente in fase di mantenimento. Partecipa regolarmente a gruppo terapeutico. Lavora su prevenzione ricadute e gestione stress.',
  
  // Assessment notes
  'Valutazione iniziale: paziente consapevole del problema, motivazione al cambiamento presente ma ambivalente. Storia familiare positiva per dipendenze.',
  'Test AUDIT score: 24/40 (dipendenza severa). CAGE positivo 4/4. Necessario intervento intensivo.',
  'Assessment neuropsicologico: lievi deficit cognitivi correlati all\'uso prolungato. Programma riabilitazione cognitiva.',
  
  // Family and social notes
  'Coinvolta moglie nel percorso. Psicoeducazione sulla dipendenza. Migliorata comunicazione coppia.',
  'Situazione lavorativa compromessa. Attivato servizio sociale per supporto reinserimento professionale.',
  'Problemi legali in corso. Coordinamento con avvocato per definizione situazione penale.',
  
  // Medical notes
  'Parametri ematochimici nella norma. Funzionalità epatica migliorata rispetto ad ingresso. Continua astinenza.',
  'Prescritto naltrexone 50mg/die. Monitoraggio effetti collaterali. Paziente tollera bene farmaco.',
  'Sindrome astinenziale gestita con benzodiazepine a scalare. Completato detox senza complicazioni.'
];

const realisticClinicalRecords = [
  // Records for alcohol addiction patients
  {
    patient_id: 1, // Marco Rossi
    record_number: 'FCR-2024-001',
    status: 'active',
    diagnosis: 'F10.20 - Disturbi correlati all\'alcol, dipendenza, non specificata',
    treatment_plan: 'Programma di disintossicazione ambulatoriale, terapia cognitivo-comportamentale, partecipazione gruppo AA, supporto farmacologico con naltrexone',
    notes: 'Paziente di 38 anni con storia di dipendenza da alcol da circa 8 anni. Ultima ricaduta 3 mesi fa. Forte motivazione al cambiamento. Supporto familiare presente. Iniziato trattamento con naltrexone 50mg/die. Frequenta gruppo AA 3 volte/settimana.',
    created_by: 2 // Dr. Direzione Clinica
  },
  
  {
    patient_id: 2, // Giulia Bianchi  
    record_number: 'FCR-2024-002',
    status: 'active',
    diagnosis: 'F10.11 - Disturbi correlati all\'alcol, uso moderato con episodi di binge drinking',
    treatment_plan: 'Terapia cognitivo-comportamentale, training autocontrollo, supporto psicologico intensivo, monitoraggio settimanale',
    notes: 'Paziente di 31 anni con pattern di binge drinking weekend. Episodi di blackout. Iniziata terapia CBT focalizzata su trigger identification e coping strategies. Buona insight e collaborazione.',
    created_by: 3 // Conduttrice Laura Ferrari
  },
  
  {
    patient_id: 3, // Alessandro Verdi
    record_number: 'FCR-2024-003', 
    status: 'active',
    diagnosis: 'F10.20 + F13.20 - Dipendenza da alcol e benzodiazepine',
    treatment_plan: 'Detox graduale benzodiazepine, programma riabilitativo intensivo, terapia individuale e di gruppo, supporto farmacologico',
    notes: 'Politossiccodipendenza complessa. Paziente di 45 anni. Storia di multiple ricadute. Completato detox benzodiazepinico senza complicazioni. Continua supporto per dipendenza alcolica. Migliorate condizioni psicofisiche generali.',
    created_by: 6 // Dr. Marco Verdi
  },
  
  // Records for drug addiction patients
  {
    patient_id: 4, // Francesca Ferrari
    record_number: 'FCR-2024-004',
    status: 'active', 
    diagnosis: 'F14.21 - Disturbi correlati alla cocaina, dipendenza, in remissione precoce',
    treatment_plan: 'Mantenimento astinenza, terapia individuale CBT, gestione craving, supporto psicosociale, prevenzione ricadute',
    notes: 'Ex dipendenza da cocaina. Astinenza mantenuta da 6 mesi. Paziente di 33 anni, buon livello socio-culturale. Lavora su prevenzione ricadute e gestione stress. Relazioni interpersonali migliorate. Progetto di reinserimento lavorativo.',
    created_by: 4 // Conduttore Alessandro Conti
  },
  
  {
    patient_id: 5, // Roberto Conti
    record_number: 'FCR-2024-005',
    status: 'active',
    diagnosis: 'F11.20 - Disturbi correlati agli oppioidi, dipendenza',
    treatment_plan: 'Terapia sostitutiva con metadone 60mg/die, counseling settimanale, supporto psicosociale, monitoraggio urine',
    notes: 'Paziente di 36 anni in terapia sostitutiva da 2 anni. Dosaggio stabile metadone 60mg. Buona compliance. Situazione sociale stabilizzata. Lavoro part-time. Urine clean da 4 mesi. Valutazione per detox graduale.',
    created_by: 6 // Dr. Marco Verdi  
  },
  
  {
    patient_id: 6, // Elena Marino
    record_number: 'FCR-2024-006',
    status: 'active',
    diagnosis: 'F15.20 + F12.10 - Dipendenza da stimolanti e uso problematico cannabis',
    treatment_plan: 'Approccio motivazionale, terapia di gruppo per giovani adulti, psicoeducazione, supporto familiare',
    notes: 'Paziente giovane (28 anni) prima esperienza trattamento. Uso MDMA e cannabis problematico. Buona motivazione iniziale. Famiglia collaborativa. Frequenta gruppo terapeutico specifico per giovani adulti. Migliorata consapevolezza problema.',
    created_by: 5 // Conduttrice Giulia Bianchi (gruppi)
  },
  
  // Records for gambling addiction
  {
    patient_id: 7, // Andrea Lombardi  
    record_number: 'FCR-2024-007',
    status: 'active',
    diagnosis: 'F63.0 - Gioco d\'azzardo patologico',
    treatment_plan: 'Terapia cognitivo-comportamentale specifica per GAP, gestione impulsi, ristrutturazione cognitiva, supporto debiti',
    notes: 'Ludopatia severa con debiti significativi (€85.000). Paziente di 40 anni. Perdita lavoro e crisi familiare. Auto-esclusione da tutti i locali. Iniziata terapia CBT specifica. Attivato supporto sociale per gestione debiti.',
    created_by: 9 // Counselor Roberto Galli
  },
  
  {
    patient_id: 8, // Silvia Galli
    record_number: 'FCR-2024-008', 
    status: 'active',
    diagnosis: 'F63.0 - Gioco d\'azzardo patologico (online gambling)',
    treatment_plan: 'Terapia individuale CBT, controllo impulsi, software blocco siti, gruppo auto-aiuto giocatori anonimi',
    notes: 'Ludopatia online (poker e slot). Paziente di 35 anni. Debiti contenuti (€15.000). Mantenuto lavoro. Installato software controllo accessi. Partecipa a Giocatori Anonimi. Migliorato controllo impulsi.',
    created_by: 10 // Counselor Francesca Costa
  },
  
  // Complex cases with comorbidities  
  {
    patient_id: 9, // Davide Ricci
    record_number: 'FCR-2024-009',
    status: 'active', 
    diagnosis: 'F10.20 + F14.20 + F63.0 - Politossiccodipendenza e gioco patologico',
    treatment_plan: 'Trattamento integrato multi-problematico, case management intensivo, terapia individuale e gruppo, supporto sociale',
    notes: 'Caso complesso. Paziente di 48 anni con multiple dipendenze. Storia di numerose ricadute. Situazione sociale compromessa. Avviato programma intensivo. Necessario approccio multidisciplinare. Lenti ma costanti miglioramenti.',
    created_by: 3 // Conduttrice Laura Ferrari
  },
  
  {
    patient_id: 10, // Chiara Esposito
    record_number: 'FCR-2024-010',
    status: 'active',
    diagnosis: 'F10.20 + F50.2 - Dipendenza da alcol e disturbi alimentari',
    treatment_plan: 'Approccio integrato dipendenze-DCA, terapia nutrizionale, supporto medico, psicoterapia individuale',
    notes: 'Comorbidità alcol-disturbi alimentari. Paziente di 32 anni. Alternanza binge-restrizione. BMI ai limiti inferiori. Coordinamento con nutrizionista. Migliorata relazione con cibo e alcol. Supporto medico continuativo.',
    created_by: 4 // Conduttore Alessandro Conti
  },
  
  // Success stories - discharged patients
  {
    patient_id: 11, // Matteo Romano
    record_number: 'FCR-2024-011',
    status: 'closed',
    diagnosis: 'F10.21 - Disturbi correlati all\'alcol, dipendenza, in remissione sostenuta',
    treatment_plan: 'Mantenimento sobrietà, follow-up mensile, supporto gruppo AA, prevenzione ricadute',
    notes: 'Completato programma riabilitativo con successo. Astinenza mantenuta per 18 mesi. Paziente di 41 anni. Ricostruiti rapporti familiari e lavorativi. Continua follow-up mensile e partecipazione AA. Ottima prognosi.',
    created_by: 3 // Conduttrice Laura Ferrari
  },
  
  {
    patient_id: 12, // Valentina Costa
    record_number: 'FCR-2024-012', 
    status: 'closed',
    diagnosis: 'F14.21 - Disturbi correlati alla cocaina, dipendenza, in remissione completa',
    treatment_plan: 'Recovery completato, ora peer counselor nel programma, supervisione mensile',
    notes: 'Eccellente outcome. Recupero completo da dipendenza cocaina dopo 2 anni programma. Ora peer counselor per nuovi pazienti. Esempio di recovery di successo. Continua supervisione come volontaria.',
    created_by: 4 // Conduttore Alessandro Conti
  },
  
  // Suspended patients
  {
    patient_id: 13, // Luca Fontana  
    record_number: 'FCR-2024-013',
    status: 'archived',
    diagnosis: 'F12.20 + F15.20 - Dipendenza multipla cannabis e stimolanti', 
    treatment_plan: 'Sospensione temporanea per violazione contratto terapeutico, rivalutazione motivazionale prevista',
    notes: 'Paziente di 30 anni. Sospeso per uso sostanze durante trattamento e comportamenti aggressivi. Violato contratto terapeutico. Rivalutazione motivazione in programma tra 3 mesi. Mantenuto supporto per emergenze.',
    created_by: 5 // Conduttrice Giulia Bianchi
  },
  
  // Current active treatments
  {
    patient_id: 14, // Sara Moretti
    record_number: 'FCR-2024-014',
    status: 'active',
    diagnosis: 'F13.21 - Disturbi correlati ai sedativi, dipendenza, in remissione precoce',
    treatment_plan: 'Post-detox benzodiazepinico, terapia CBT, gestione ansia, supporto psicologico intensivo',
    notes: 'Completato detox da benzodiazepine ad alte dosi. Paziente di 37 anni. Iniziata dipendenza per trattamento ansia. Ora lavora su gestione ansia senza farmaci. Tecniche rilassamento e mindfulness. Buoni progressi.',
    created_by: 6 // Dr. Marco Verdi
  },
  
  // Young adults
  {
    patient_id: 15, // Tommaso Giuliani
    record_number: 'FCR-2024-015',
    status: 'active', 
    diagnosis: 'F12.20 + F19.20 - Dipendenza cannabis e sostanze sintetiche',
    treatment_plan: 'Programma giovani adulti, terapia familiare, motivational interviewing, peer support',
    notes: 'Giovane di 25 anni. Prima esperienza trattamento. Uso cannabis quotidiano e sostanze sintetiche (2CB, ketamina) nei weekend. Famiglia supportiva. Frequenta gruppo giovani adulti. Migliorata motivazione al trattamento.',
    created_by: 5 // Conduttrice Giulia Bianchi
  },
  
  {
    patient_id: 16, // Martina Pellegrini
    record_number: 'FCR-2024-016',
    status: 'active',
    diagnosis: 'F10.11 + F12.10 - Uso problematico alcol e cannabis',
    treatment_plan: 'Intervento precoce giovani, terapia breve orientata alla soluzione, supporto famiglia, psicoeducazione',
    notes: 'Prima volta in trattamento. Paziente di 24 anni. Uso alcol e cannabis problematico ma non ancora dipendenza severa. Ottima opportunità intervento precoce. Famiglia molto collaborativa. Buona prognosi.',
    created_by: 4 // Conduttore Alessandro Conti
  }
];

/**
 * Seeds the database with realistic clinical records for addiction recovery
 */
const seedRealisticClinicalRecords = async () => {
  try {
    console.log('🌱 Starting realistic clinical records seeding...');
    
    const createdRecords = [];
    
    for (const recordData of realisticClinicalRecords) {
      // Check if record already exists  
      const existingRecord = await ClinicalRecord.findByRecordNumber(recordData.record_number);
      
      if (!existingRecord) {
        const record = await ClinicalRecord.create({
          ...recordData,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        createdRecords.push(record);
        console.log(`✅ Created clinical record: ${record.record_number} (${record.diagnosis.split(' - ')[0]})`);
      } else {
        console.log(`⚠️  Clinical record already exists: ${recordData.record_number}`);
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdRecords.length} realistic clinical records for addiction recovery`);
    return createdRecords;
    
  } catch (error) {
    console.error('❌ Error seeding realistic clinical records:', error);
    throw error;
  }
};

module.exports = {
  realisticClinicalRecords,
  addictionDiagnoses,
  treatmentPlans,
  clinicalNotes,
  seedRealisticClinicalRecords
};