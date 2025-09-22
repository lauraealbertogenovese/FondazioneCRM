/**
 * Realistic Support Groups Data Seeder for Addiction Recovery Foundation
 * 
 * This file contains realistic support group data specifically tailored for
 * addiction recovery treatment, including various types of therapeutic groups.
 */

const { Group } = require('../models');

const realisticSupportGroups = [
  // Alcohol Recovery Groups
  {
    name: 'Gruppo Alcolisti Anonimi - Serale',
    description: 'Gruppo di auto-aiuto basato sul programma dei 12 passi di AA. Incontri serali per permettere partecipazione dopo lavoro. Atmosfera accogliente e non giudicante.',
    group_type: 'support',
    status: 'active',
    max_members: 15,
    meeting_frequency: 'Martedì e Giovedì ore 19:30',
    meeting_location: 'Sala Speranza - Piano Terra',
    start_date: new Date('2024-01-15'),
    end_date: null, // Ongoing
    facilitator_notes: 'Gruppo consolidato con core storico di membri. Buona accoglienza nuovi arrivati. Focus su condivisione esperienze e supporto reciproco.',
    created_by: 9, // Counselor Roberto Galli
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10')
  },

  {
    name: 'Gruppo Famiglie Al-Anon',
    description: 'Gruppo di supporto per familiari e amici di persone con problemi di alcol. Basato sui principi Al-Anon per il recupero della famiglia.',
    group_type: 'family',
    status: 'active', 
    max_members: 12,
    meeting_frequency: 'Mercoledì ore 18:00',
    meeting_location: 'Sala Serenità - Primo Piano',
    start_date: new Date('2024-02-01'),
    end_date: null,
    facilitator_notes: 'Gruppo misto coniugi, genitori e figli adulti. Lavoro su codipendenza e boundaries. Molto supportivo.',
    created_by: 8, // Assistente Sociale Silvia Marino
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25')
  },

  // Drug Recovery Groups  
  {
    name: 'Narcotici Anonimi - Mattino',
    description: 'Gruppo NA per persone in recovery da droghe. Programma 12 passi adattato per dipendenze da stupefacenti. Incontri mattutini.',
    group_type: 'support',
    status: 'active',
    max_members: 20,
    meeting_frequency: 'Lunedì, Mercoledì, Venerdì ore 10:00',
    meeting_location: 'Sala Rinascita - Piano Terra', 
    start_date: new Date('2024-01-08'),
    end_date: null,
    facilitator_notes: 'Gruppo molto attivo. Partecipazione costante. Buon mix tra membri nuovi e con anni di clean time.',
    created_by: 10, // Counselor Francesca Costa
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03')
  },

  {
    name: 'Gruppo Giovani Adulti - Recovery',
    description: 'Gruppo terapeutico per giovani adulti (18-30 anni) con problemi di dipendenza. Focus su sviluppo identità, relazioni e progettualità.',
    group_type: 'therapy',
    status: 'active',
    max_members: 10,
    meeting_frequency: 'Martedì ore 16:00',
    meeting_location: 'Sala Futuro - Primo Piano',
    start_date: new Date('2024-02-15'),
    end_date: new Date('2024-12-15'), // 10-month program
    facilitator_notes: 'Gruppo chiuso terapeutico. Focus su transizione età adulta. Uso di tecniche espressive e creative.',
    created_by: 5, // Conduttrice Giulia Bianchi
    created_at: new Date('2024-02-10'),
    updated_at: new Date('2024-02-10')
  },

  // Gambling Recovery Groups
  {
    name: 'Giocatori Anonimi - Supporto',
    description: 'Gruppo di auto-aiuto per persone con problemi di gioco d\'azzardo. Condivisione esperienze e strategie per mantenere astinenza dal gioco.',
    group_type: 'support', 
    status: 'active',
    max_members: 12,
    meeting_frequency: 'Giovedì ore 20:00',
    meeting_location: 'Sala Coraggio - Primo Piano',
    start_date: new Date('2024-01-20'),
    end_date: null,
    facilitator_notes: 'Gruppo in crescita. Difficoltà iniziali nell\'aprirsi, ora buona coesione. Lavoro su gestione impulsi.',
    created_by: 9, // Counselor Roberto Galli  
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },

  {
    name: 'Gruppo Famiglie Gioco d\'Azzardo',
    description: 'Supporto per familiari di persone con ludopatia. Focus su gestione crisi finanziarie, ricostruzione fiducia, comunicazione efficace.',
    group_type: 'family',
    status: 'active',
    max_members: 8,
    meeting_frequency: 'Secondo e quarto Sabato del mese ore 15:00',
    meeting_location: 'Sala Speranza - Piano Terra', 
    start_date: new Date('2024-02-10'),
    end_date: null,
    facilitator_notes: 'Gruppo mensile per famiglie. Spesso situazioni economiche critiche. Lavoro su supporto pratico ed emotivo.',
    created_by: 7, // Assistente Sociale Elena Romano
    created_at: new Date('2024-02-05'),
    updated_at: new Date('2024-02-05')
  },

  // Therapeutic Groups
  {
    name: 'Gruppo Terapeutico CBT - Dipendenze',
    description: 'Gruppo di terapia cognitivo-comportamentale per diverse tipologie di dipendenze. Tecniche di prevenzione ricadute e ristrutturazione cognitiva.',
    group_type: 'therapy',
    status: 'active',
    max_members: 8,
    meeting_frequency: 'Mercoledì ore 14:30',
    meeting_location: 'Sala Terapia - Primo Piano',
    start_date: new Date('2024-01-10'),
    end_date: new Date('2024-07-10'), // 6-month program
    facilitator_notes: 'Gruppo semi-aperto con possibilità inserimenti ogni mese. Lavoro strutturato su ABC model e homework settimanali.',
    created_by: 3, // Conduttrice Laura Ferrari
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-05')
  },

  {
    name: 'Gruppo Mindfulness e Recovery',
    description: 'Gruppo che integra pratiche mindfulness nel percorso di recovery. Meditazione, consapevolezza corporea, gestione stress e craving.',
    group_type: 'therapy',
    status: 'active', 
    max_members: 12,
    meeting_frequency: 'Venerdì ore 17:00',
    meeting_location: 'Sala Calma - Primo Piano',
    start_date: new Date('2024-02-20'),
    end_date: null,
    facilitator_notes: 'Approccio innovativo molto apprezzato. Riduzione stress e ansia. Migliorata gestione impulsi e craving.',
    created_by: 4, // Conduttore Alessandro Conti
    created_at: new Date('2024-02-15'),
    updated_at: new Date('2024-02-15')
  },

  // Skills Training Groups
  {
    name: 'Gruppo Skills Sociali - Reinserimento',  
    description: 'Gruppo per sviluppare competenze sociali e lavorative necessarie per il reinserimento. Role-playing, simulazioni, networking.',
    group_type: 'activity',
    status: 'active',
    max_members: 10,
    meeting_frequency: 'Lunedì ore 15:00',
    meeting_location: 'Sala Laboratorio - Piano Terra',
    start_date: new Date('2024-01-22'),
    end_date: new Date('2024-06-22'), // 5-month program
    facilitator_notes: 'Focus pratico su CV, colloqui lavoro, competenze relazionali. Collaborazione con centro per l\'impiego.',
    created_by: 7, // Assistente Sociale Elena Romano
    created_at: new Date('2024-01-17'),
    updated_at: new Date('2024-01-17')
  },

  {
    name: 'Gruppo Gestione Rabbia e Conflitti',
    description: 'Gruppo per apprendere tecniche di gestione della rabbia e risoluzione conflitti. Spesso correlate a problemi di dipendenza.',
    group_type: 'therapy',
    status: 'active',
    max_members: 8,
    meeting_frequency: 'Giovedì ore 10:30', 
    meeting_location: 'Sala Terapia - Primo Piano',
    start_date: new Date('2024-02-01'),
    end_date: new Date('2024-05-01'), // 3-month program
    facilitator_notes: 'Gruppo chiuso intensivo. Partecipanti con storia di agiti etero/auto aggressivi. Lavoro su trigger e strategie coping.',
    created_by: 4, // Conduttore Alessandro Conti
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25')
  },

  // Mixed/Multi-addiction Groups
  {
    name: 'Gruppo Multi-dipendenze - Supporto',
    description: 'Gruppo aperto per persone con multiple dipendenze (cross-addiction). Condivisione esperienze e supporto reciproco.',
    group_type: 'support',
    status: 'active',
    max_members: 15,
    meeting_frequency: 'Martedì ore 11:00',
    meeting_location: 'Sala Rinascita - Piano Terra',
    start_date: new Date('2024-01-30'),
    end_date: null,
    facilitator_notes: 'Gruppo complesso per casi multi-problematici. Richiede facilitazione esperta. Buoni risultati su senso appartenenza.',
    created_by: 13, // Peer Counselor Andrea Lombardi
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25')
  },

  // Women-specific Group
  {
    name: 'Gruppo Donne in Recovery',
    description: 'Gruppo di supporto specifico per donne con problemi di dipendenza. Focus su tematiche di genere, traumi, maternità, relazioni.',
    group_type: 'support',
    status: 'active',
    max_members: 10,
    meeting_frequency: 'Mercoledì ore 16:30',
    meeting_location: 'Sala Rosa - Primo Piano',
    start_date: new Date('2024-02-05'),
    end_date: null,
    facilitator_notes: 'Gruppo molto coeso. Lavoro su traumi specifici femminili, violenza, maternità. Ambiente protetto e supportivo.',
    created_by: 14, // Peer Counselor Valentina Esposito
    created_at: new Date('2024-01-30'),
    updated_at: new Date('2024-01-30')
  },

  // Completed/Ended Groups  
  {
    name: 'Gruppo CBT Intensivo - Novembre 2023',
    description: 'Gruppo terapeutico intensivo completato. Ottimi risultati sui partecipanti. Programma strutturato 12 settimane.',
    group_type: 'therapy',
    status: 'completed',
    max_members: 8,
    meeting_frequency: 'Bi-settimanale',
    meeting_location: 'Sala Terapia - Primo Piano',
    start_date: new Date('2023-11-01'),
    end_date: new Date('2024-01-31'),
    facilitator_notes: 'Programma completato con successo. 7/8 partecipanti hanno mantenuto astinenza. Follow-up a 3 mesi positivo.',
    created_by: 3, // Conduttrice Laura Ferrari
    created_at: new Date('2023-10-25'),
    updated_at: new Date('2024-02-01')
  },

  // Suspended Group
  {
    name: 'Gruppo Adolescenti - Sospeso',
    description: 'Gruppo per adolescenti con problemi di sostanze. Temporaneamente sospeso per mancanza partecipanti stabili.',
    group_type: 'therapy',
    status: 'inactive',
    max_members: 8,
    meeting_frequency: 'Venerdì ore 16:00',
    meeting_location: 'Sala Giovani - Piano Terra', 
    start_date: new Date('2024-01-15'),
    end_date: null,
    facilitator_notes: 'Difficoltà mantenimento frequenza adolescenti. Necessario ripensare format. Valutazione ripresa a settembre.',
    created_by: 5, // Conduttrice Giulia Bianchi
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-03-01')
  }
];

/**
 * Seeds the database with realistic support groups data for addiction recovery
 */
const seedRealisticSupportGroups = async () => {
  try {
    console.log('🌱 Starting realistic support groups seeding...');
    
    const createdGroups = [];
    
    for (const groupData of realisticSupportGroups) {
      // Check if group already exists
      const existingGroup = await Group.findByName(groupData.name);
      
      if (!existingGroup) {
        const group = await Group.create(groupData);
        createdGroups.push(group);
        console.log(`✅ Created support group: ${group.name} (${group.group_type})`);
      } else {
        console.log(`⚠️  Support group already exists: ${groupData.name}`);
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdGroups.length} realistic support groups for addiction recovery`);
    return createdGroups;
    
  } catch (error) {
    console.error('❌ Error seeding realistic support groups:', error);
    throw error;
  }
};

module.exports = {
  realisticSupportGroups,
  seedRealisticSupportGroups
};