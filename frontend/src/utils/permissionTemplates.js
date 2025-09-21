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
    clinical_notes: {
      label: "Note Cliniche",
      description: "Gestione note cliniche dei pazienti", 
      access: false,
      create: false,
      edit_own: false,     // Modifica solo note proprie
      edit_all: false,     // Modifica tutte le note
      delete: false,
      view_all: false      // Visualizza tutte le note
    },
    groups: {
      label: "Gruppi di Supporto",
      description: "Gestione gruppi terapeutici",
      access: false,
      create: false,
      edit_own: false,     // Solo gruppi dove si è psicologi
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
      view_financial_data: false
    }
  },

  // === FUNZIONALITÀ SPECIFICHE ===
  features: {
    documents: {
      label: "Gestione Documenti",
      description: "Upload, download e gestione documenti pazienti/gruppi",
      upload: false,           // Upload generale
      download: false,         // Download generale  
      delete: false,          // Eliminazione documenti
      manage_versions: false  // Gestione versioni documenti
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
      delete: false,
      assign: false,           // Assegnazione ruoli a utenti
      manage_permissions: false // Gestione permessi specifici
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
        clinical_notes: { 
          access: true, create: true, edit_own: true, view_all: false 
        },
        groups: { access: true, edit_own: true, manage_members: false },
        billing: { access: false }
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
  },
  
  supervisor: {
    name: "Supervisore",
    description: "Accesso completo a pazienti, gruppi e note cliniche",
    permissions: {
      pages: {
        patients: { 
          access: true, create: true, edit_all: true, delete: true, view_sensitive: true 
        },
        clinical_notes: { 
          access: true, create: true, edit_all: true, delete: true, view_all: true 
        },
        groups: { 
          access: true, create: true, edit_all: true, manage_members: true, delete: true 
        },
        billing: { 
          access: true, create_invoices: true, edit_invoices: true, view_financial_data: true 
        }
      },
      features: {
        documents: { upload: true, download: true, delete: true, manage_versions: true }
      },
      administration: {
        users: { 
          access: true, create: true, edit: true, delete: false, 
          view_permissions: true, edit_permissions: true 
        },
        roles: { 
          access: true, create: false, edit: false, delete: false, 
          assign: true, manage_permissions: false 
        },
        system: { access: false }
      }
    }
  },
  
  admin: {
    name: "Amministratore",
    description: "Accesso completo al sistema",
    permissions: {
      pages: {
        patients: { 
          access: true, create: true, edit_all: true, delete: true, view_sensitive: true 
        },
        clinical_notes: { 
          access: true, create: true, edit_all: true, delete: true, view_all: true 
        },
        groups: { 
          access: true, create: true, edit_all: true, manage_members: true, delete: true 
        },
        billing: { 
          access: true, create_invoices: true, edit_invoices: true, view_financial_data: true 
        }
      },
      features: {
        documents: { upload: true, download: true, delete: true, manage_versions: true }
      },
      administration: {
        users: { 
          access: true, create: true, edit: true, delete: true, 
          view_permissions: true, edit_permissions: true 
        },
        roles: { 
          access: true, create: true, edit: true, delete: true, 
          assign: true, manage_permissions: true 
        },
        system: { 
          access: true, email_config: true, audit_logs: true 
        }
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
