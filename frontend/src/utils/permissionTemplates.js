// Template permessi granulari per il CRM Fondazione
export const GRANULAR_PERMISSION_TEMPLATE = {
  // === NAVIGAZIONE E ACCESSO PAGINE ===
  pages: {
    patients: {
      label: "Pazienti", 
      description: "Gestione anagrafica pazienti",
      access: false,
      create: false,
      edit_own: false,     // Modifica solo pazienti assegnati
      edit_all: false,     // Modifica tutti i pazienti
      delete: false,
      view_sensitive: false // Dati sensibili (telefono, email, etc.)
    },
    clinical: {
      label: "Cartelle Cliniche",
      description: "Gestione cartelle e note cliniche", 
      access: false,
      create_records: false,
      edit_own_records: false,
      edit_all_records: false,
      create_notes: false,
      edit_own_notes: false,
      edit_all_notes: false,
      delete_notes: false,
      view_all_records: false
    },
    groups: {
      label: "Gruppi di Supporto",
      description: "Gestione gruppi terapeutici",
      access: false,
      create: false,
      edit_own: false,     // Solo gruppi dove si è conduttori
      edit_all: false,     // Tutti i gruppi
      manage_members: false,
      delete: false
    },
    billing: {
      label: "Fatturazione", 
      description: "Gestione fatture e pagamenti",
      access: false,
      create_invoices: false,
      edit_invoices: false,
      view_financial_data: false,
      export_data: false
    }
  },

  // === FUNZIONALITÀ SPECIFICHE ===
  features: {
    documents: {
      label: "Gestione Documenti",
      description: "Upload, download e gestione documenti pazienti/gruppi",
      upload: false,
      download: false,
      delete: false
    },
  },

  // === AMMINISTRAZIONE ===
  administration: {
    users: {
      label: "Gestione Utenti",
      description: "Creazione e gestione utenti",
      access: false,
      create: false,
      edit: false,
      delete: false,
      view_permissions: false,
      edit_permissions: false
    },
    roles: {
      label: "Gestione Ruoli", 
      description: "Creazione e gestione ruoli personalizzati",
      access: false,
      create: false,
      edit: false,
      delete: false
    },
    system: {
      label: "Impostazioni Sistema",
      description: "Configurazioni globali del sistema",
      access: false,
      email_config: false,
      audit_logs: false
    }
  }
};

// Template predefiniti per ruoli comuni
export const ROLE_PRESETS = {
  operator: {
    name: "Operatore Base",
    description: "Accesso base a pazienti e gruppi",
    permissions: {
      pages: {
        patients: { 
          access: true, create: true, edit_own: true, view_sensitive: false 
        },
        clinical: { 
          access: true, create_records: true, edit_own_records: true, 
          create_notes: true, edit_own_notes: true, view_all_records: false 
        },
        groups: { access: true, edit_own: false, manage_members: false }
      },
      features: {
        documents: { upload: true, download: true }
      },
      administration: {
        users: { access: false },
        roles: { access: false },
        system: { access: false }
      }
    }
  }
};

// Funzioni helper per validazione permessi
export const hasPageAccess = (userPermissions, page) => {
  return userPermissions?.pages?.[page]?.access === true;
};

export const hasFeatureAccess = (userPermissions, feature, action) => {
  return userPermissions?.features?.[feature]?.[action] === true;
};

export const hasAdminAccess = (userPermissions, section, action = 'access') => {
  return userPermissions?.administration?.[section]?.[action] === true;
};
