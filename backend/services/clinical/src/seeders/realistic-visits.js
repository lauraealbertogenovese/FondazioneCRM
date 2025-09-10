/**
 * Realistic Therapeutic Visits/Sessions Data Seeder for Addiction Recovery Foundation
 * 
 * This file contains realistic therapeutic session data specifically tailored for
 * addiction recovery treatment, including various types of therapy sessions.
 */

const { Visit, ClinicalRecord } = require('../models');

// Helper function to generate dates
const generateDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const generateDateTime = (daysFromNow, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const realisticTherapeuticVisits = [
  // Individual Therapy Sessions - Current/Recent
  {
    patient_id: 1, // Marco Rossi - Alcohol addiction
    visit_type: 'individual',
    visit_date: generateDateTime(-3, 14, 30), // 3 days ago at 2:30 PM
    duration_minutes: 60,
    status: 'completed',
    doctor_name: 'Dr.ssa Laura Ferrari',
    visit_notes: 'Sessione individuale CBT. Paziente riporta mantenimento astinenza da alcol. Lavoro su situazioni ad alto rischio. Identificati trigger legati a stress lavorativo. Assegnati homework per gestione stress.',
    location: 'Studio 1 - Primo Piano',
    created_at: generateDateTime(-7, 10, 0),
    updated_at: generateDateTime(-3, 15, 30)
  },

  {
    patient_id: 1, // Marco Rossi - Follow-up
    visit_type: 'follow_up', 
    visit_date: generateDateTime(4, 14, 30), // In 4 days at 2:30 PM
    duration_minutes: 45,
    status: 'scheduled',
    doctor_name: 'Dr.ssa Laura Ferrari',
    visit_notes: 'Follow-up programmato. Valutazione homework settimana precedente. Monitoraggio craving e strategie coping.',
    location: 'Studio 1 - Primo Piano',
    created_at: generateDateTime(-10, 9, 0),
    updated_at: generateDateTime(-10, 9, 0)
  },

  {
    patient_id: 2, // Giulia Bianchi - Binge drinking
    visit_type: 'individual',
    visit_date: generateDateTime(-1, 16, 0), // Yesterday at 4 PM
    duration_minutes: 50,
    status: 'completed',
    doctor_name: 'Dr. Alessandro Conti',
    visit_notes: 'Lavoro su pattern binge drinking weekend. Analisi episodi recenti. Migliorata consapevolezza trigger emotivi. Pianificazione weekend sobri con attività alternative.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(-8, 11, 0),
    updated_at: generateDateTime(-1, 16, 50)
  },

  {
    patient_id: 4, // Francesca Ferrari - Cocaine recovery
    visit_type: 'individual',
    visit_date: generateDateTime(1, 10, 30), // Tomorrow at 10:30 AM
    duration_minutes: 60,
    status: 'scheduled',
    doctor_name: 'Dr. Alessandro Conti', 
    visit_notes: 'Sessione programmata prevenzione ricadute. Focus su gestione craving e situazioni ad alto rischio. Valutazione supporto sociale.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(-7, 15, 0),
    updated_at: generateDateTime(-7, 15, 0)
  },

  // Medical/Psychiatric Sessions
  {
    patient_id: 5, // Roberto Conti - Methadone maintenance
    visit_type: 'medical',
    visit_date: generateDateTime(-5, 9, 0), // 5 days ago at 9 AM
    duration_minutes: 30,
    status: 'completed',
    doctor_name: 'Dr. Marco Verdi',
    visit_notes: 'Controllo medico terapia sostitutiva. Dosaggio metadone stabile 60mg. Parametri vitali nella norma. Esami ematochimici ok. Prossimo controllo tra 2 settimane.',
    location: 'Ambulatorio Medico - Piano Terra',
    created_at: generateDateTime(-12, 14, 0),
    updated_at: generateDateTime(-5, 9, 30)
  },

  {
    patient_id: 5, // Roberto Conti - Next medical check
    visit_type: 'medical',
    visit_date: generateDateTime(9, 9, 0), // In 9 days at 9 AM
    duration_minutes: 30,
    status: 'scheduled',
    doctor_name: 'Dr. Marco Verdi',
    visit_notes: 'Controllo medico programmato. Valutazione stato generale e terapia sostitutiva.',
    location: 'Ambulatorio Medico - Piano Terra',
    created_at: generateDateTime(-12, 14, 0),
    updated_at: generateDateTime(-12, 14, 0)
  },

  {
    patient_id: 3, // Alessandro Verdi - Complex case
    visit_type: 'medical',
    visit_date: generateDateTime(-2, 11, 30), // 2 days ago at 11:30 AM
    duration_minutes: 45,
    status: 'completed',
    doctor_name: 'Dr. Marco Verdi',
    visit_notes: 'Valutazione medica post-detox benzodiazepine. Paziente riferisce miglioramento sintomi astinenziali. PA e FC stabili. Continua supporto farmacologico con trazodone per insonnia.',
    location: 'Ambulatorio Medico - Piano Terra', 
    created_at: generateDateTime(-9, 16, 0),
    updated_at: generateDateTime(-2, 12, 15)
  },

  // Family Therapy Sessions
  {
    patient_id: 1, // Marco Rossi - Family session
    visit_type: 'family',
    visit_date: generateDateTime(-7, 18, 0), // Week ago at 6 PM
    duration_minutes: 90,
    status: 'completed',
    doctor_name: 'Dr.ssa Silvia Marino',
    visit_notes: 'Seduta terapia familiare con moglie. Lavoro su comunicazione e fiducia. Moglie esprime paure per possibili ricadute. Paziente dimostra impegno recovery. Programmate sedute quindicinali.',
    location: 'Sala Famiglia - Piano Terra',
    created_at: generateDateTime(-14, 10, 0),
    updated_at: generateDateTime(-7, 19, 30)
  },

  {
    patient_id: 7, // Andrea Lombardi - Gambling, family crisis
    visit_type: 'family',
    visit_date: generateDateTime(2, 17, 30), // Day after tomorrow at 5:30 PM
    duration_minutes: 90,
    status: 'scheduled', 
    doctor_name: 'Dr.ssa Elena Romano',
    visit_notes: 'Terapia familiare programmata. Gestione crisi finanziaria e ricostruzione fiducia coniugale. Presente moglie.',
    location: 'Sala Famiglia - Piano Terra',
    created_at: generateDateTime(-5, 12, 0),
    updated_at: generateDateTime(-5, 12, 0)
  },

  // Group Therapy Sessions
  {
    patient_id: 6, // Elena Marino - Young adults group
    visit_type: 'group',
    visit_date: generateDateTime(-4, 16, 0), // 4 days ago at 4 PM
    duration_minutes: 90,
    status: 'completed',
    doctor_name: 'Dr.ssa Giulia Bianchi',
    visit_notes: 'Partecipazione gruppo giovani adulti. Condivisione esperienza ricaduta settimana precedente. Supporto pari e elaborazione sensi colpa. Buona integrazione gruppo.',
    location: 'Sala Futuro - Primo Piano',
    created_at: generateDateTime(-11, 13, 0),
    updated_at: generateDateTime(-4, 17, 30)
  },

  {
    patient_id: 15, // Tommaso Giuliani - Young adults group  
    visit_type: 'group',
    visit_date: generateDateTime(3, 16, 0), // In 3 days at 4 PM
    duration_minutes: 90,
    status: 'scheduled',
    doctor_name: 'Dr.ssa Giulia Bianchi', 
    visit_notes: 'Gruppo giovani adulti. Lavoro su progettualità future e gestione pressioni sociali.',
    location: 'Sala Futuro - Primo Piano',
    created_at: generateDateTime(-4, 10, 0),
    updated_at: generateDateTime(-4, 10, 0)
  },

  // Intake/Assessment Sessions
  {
    patient_id: 16, // Martina Pellegrini - New patient
    visit_type: 'intake',
    visit_date: generateDateTime(-10, 15, 0), // 10 days ago at 3 PM
    duration_minutes: 120,
    status: 'completed',
    doctor_name: 'Dr. Alessandro Conti',
    visit_notes: 'Valutazione iniziale. Prima esperienza trattamento. Uso problematico alcol e cannabis da 2 anni. Famiglia supportiva. Buona motivazione. Raccomandato percorso ambulatoriale con terapia individuale e gruppo giovani.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(-17, 9, 0),
    updated_at: generateDateTime(-10, 17, 0)
  },

  {
    patient_id: 14, // Sara Moretti - Post-detox assessment
    visit_type: 'intake', 
    visit_date: generateDateTime(-15, 10, 0), // 15 days ago at 10 AM
    duration_minutes: 90,
    status: 'completed',
    doctor_name: 'Dr. Marco Verdi',
    visit_notes: 'Valutazione post-detox benzodiazepine. Completato detox ospedaliero 1 settimana fa. Paziente motivata. Sintomi astinenziali residui minimi. Avviato percorso ambulatoriale.',
    location: 'Ambulatorio Medico - Piano Terra',
    created_at: generateDateTime(-22, 14, 0),
    updated_at: generateDateTime(-15, 11, 30)
  },

  // Emergency/Crisis Sessions
  {
    patient_id: 9, // Davide Ricci - Complex case crisis
    visit_type: 'emergency',
    visit_date: generateDateTime(-6, 20, 30), // 6 days ago at 8:30 PM
    duration_minutes: 45,
    status: 'completed',
    doctor_name: 'Dr.ssa Laura Ferrari',
    visit_notes: 'Seduta di urgenza per episodio ricaduta multipla (alcol + cocaina). Paziente in stato confusionale ma collaborativo. Attivato supporto sociale. Rinforzato piano crisi. Non necessario ricovero.',
    location: 'Studio 1 - Primo Piano',
    created_at: generateDateTime(-6, 20, 30),
    updated_at: generateDateTime(-6, 21, 15)
  },

  // Cancelled/No-show Sessions
  {
    patient_id: 13, // Luca Fontana - Suspended patient
    visit_type: 'individual',
    visit_date: generateDateTime(-8, 14, 0), // 8 days ago at 2 PM
    duration_minutes: 60,
    status: 'no_show',
    doctor_name: 'Dr.ssa Giulia Bianchi',
    visit_notes: 'Paziente non presentato. Terza assenza consecutiva. Contattato telefonicamente - riferisce uso sostanze. Attivato protocollo sospensione temporanea.',
    location: 'Studio 3 - Primo Piano',
    created_at: generateDateTime(-15, 11, 0),
    updated_at: generateDateTime(-8, 14, 30)
  },

  {
    patient_id: 8, // Silvia Galli - Cancelled due to illness
    visit_type: 'individual',
    visit_date: generateDateTime(-3, 9, 30), // 3 days ago at 9:30 AM
    duration_minutes: 50,
    status: 'cancelled',
    doctor_name: 'Dr.ssa Francesca Costa',
    visit_notes: 'Seduta cancellata per influenza paziente. Riprogrammata per prossima settimana. Breve check telefonico - situazione gambling under control.',
    location: 'Studio Counseling - Piano Terra',
    created_at: generateDateTime(-10, 16, 0),
    updated_at: generateDateTime(-3, 8, 45)
  },

  // Upcoming Scheduled Sessions
  {
    patient_id: 2, // Giulia Bianchi
    visit_type: 'individual',
    visit_date: generateDateTime(7, 16, 0), // In a week at 4 PM
    duration_minutes: 50,
    status: 'scheduled',
    doctor_name: 'Dr. Alessandro Conti',
    visit_notes: 'Sessione programmata CBT. Continuazione lavoro su prevenzione binge drinking.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(0, 10, 0),
    updated_at: generateDateTime(0, 10, 0)
  },

  {
    patient_id: 4, // Francesca Ferrari
    visit_type: 'individual',
    visit_date: generateDateTime(8, 10, 30), // In 8 days at 10:30 AM  
    duration_minutes: 60,
    status: 'scheduled',
    doctor_name: 'Dr. Alessandro Conti',
    visit_notes: 'Follow-up mantenimento astinenza. Valutazione supporto sociale e attività lavorativa.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(1, 11, 0),
    updated_at: generateDateTime(1, 11, 0)
  },

  {
    patient_id: 10, // Chiara Esposito - Complex case alcohol + eating
    visit_type: 'individual',
    visit_date: generateDateTime(5, 15, 30), // In 5 days at 3:30 PM
    duration_minutes: 75,
    status: 'scheduled',
    doctor_name: 'Dr. Alessandro Conti',
    visit_notes: 'Sessione integrata dipendenza-DCA. Monitoraggio peso e comportamenti alimentari. Coordinamento con nutrizionista.',
    location: 'Studio 2 - Primo Piano',
    created_at: generateDateTime(-2, 12, 0),
    updated_at: generateDateTime(-2, 12, 0)
  },

  {
    patient_id: 6, // Elena Marino - Group session
    visit_type: 'group',
    visit_date: generateDateTime(10, 16, 0), // In 10 days at 4 PM
    duration_minutes: 90,
    status: 'scheduled',
    doctor_name: 'Dr.ssa Giulia Bianchi',
    visit_notes: 'Gruppo giovani adulti. Sessione su gestione pressioni sociali e mantenimento astinenza.',
    location: 'Sala Futuro - Primo Piano',
    created_at: generateDateTime(3, 9, 0),
    updated_at: generateDateTime(3, 9, 0)
  },

  {
    patient_id: 7, // Andrea Lombardi - Gambling follow-up
    visit_type: 'individual',
    visit_date: generateDateTime(6, 18, 30), // In 6 days at 6:30 PM
    duration_minutes: 60,
    status: 'scheduled',
    doctor_name: 'Counselor Roberto Galli',
    visit_notes: 'Follow-up gambling addiction. Monitoraggio astinenza da gioco e gestione situazione finanziaria.',
    location: 'Studio Counseling - Piano Terra',
    created_at: generateDateTime(-1, 14, 0),
    updated_at: generateDateTime(-1, 14, 0)
  },

  // Rescheduled Sessions
  {
    patient_id: 3, // Alessandro Verdi
    visit_type: 'individual',
    visit_date: generateDateTime(12, 11, 0), // In 12 days at 11 AM (rescheduled)
    duration_minutes: 60,
    status: 'rescheduled',
    doctor_name: 'Dr.ssa Laura Ferrari',
    visit_notes: 'Seduta riprogrammata per impegno lavorativo paziente. Originariamente prevista per il 15 marzo.',
    location: 'Studio 1 - Primo Piano',
    created_at: generateDateTime(-5, 15, 0),
    updated_at: generateDateTime(0, 9, 30)
  }
];

/**
 * Seeds the database with realistic therapeutic visits for addiction recovery
 */
const seedRealisticTherapeuticVisits = async () => {
  try {
    console.log('🌱 Starting realistic therapeutic visits seeding...');
    
    const createdVisits = [];
    
    for (const visitData of realisticTherapeuticVisits) {
      try {
        // Get the clinical record ID for this patient (use first available)
        const clinicalRecords = await ClinicalRecord.findByPatientId(visitData.patient_id, 1);
        if (!clinicalRecords || clinicalRecords.length === 0) {
          console.log(`⚠️  No clinical record found for patient ${visitData.patient_id}, skipping visit`);
          continue;
        }
        
        const clinicalRecordId = clinicalRecords[0].id;
        
        // Check if visit already exists (based on clinical record, date, and type)
        const existingVisit = await Visit.findByClinicalRecordDateType(
          clinicalRecordId,
          visitData.visit_date,
          visitData.visit_type
        );
        
        if (!existingVisit) {
          // Replace patient_id with clinical_record_id and clean up the data
          const cleanedVisitData = {
            clinical_record_id: clinicalRecordId,
            visit_type: visitData.visit_type,
            visit_date: visitData.visit_date,
            doctor_name: visitData.doctor_name || 'Dr. Smith',
            visit_notes: visitData.notes,
            follow_up_date: visitData.next_visit_date,
            status: visitData.status || 'completed',
            created_by: visitData.created_by
          };
          
          const visit = await Visit.create(cleanedVisitData);
          createdVisits.push(visit);
          console.log(`✅ Created therapeutic visit: ${visit.visit_type} - Record ${clinicalRecordId} (${visit.status})`);
        } else {
          console.log(`⚠️  Therapeutic visit already exists: ${visitData.visit_type} - Patient ${visitData.patient_id}`);
        }
      } catch (error) {
        console.error(`❌ Error creating visit for patient ${visitData.patient_id}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdVisits.length} realistic therapeutic visits for addiction recovery`);
    return createdVisits;
    
  } catch (error) {
    console.error('❌ Error seeding realistic therapeutic visits:', error);
    throw error;
  }
};

module.exports = {
  realisticTherapeuticVisits,
  seedRealisticTherapeuticVisits
};