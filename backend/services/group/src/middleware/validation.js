const Joi = require('joi');

// Schema per la validazione dei gruppi
const groupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Il nome deve essere una stringa',
      'string.empty': 'Il nome del gruppo è obbligatorio',
      'string.min': 'Il nome deve avere almeno 2 caratteri',
      'string.max': 'Il nome non può superare 100 caratteri',
      'any.required': 'Il nome del gruppo è obbligatorio'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'La descrizione deve essere una stringa',
      'string.max': 'La descrizione non può superare 1000 caratteri'
    }),

  group_type: Joi.string()
    .valid('support', 'therapy', 'activity', 'education', 'rehabilitation')
    .required()
    .messages({
      'string.base': 'Il tipo di gruppo deve essere una stringa',
      'any.only': 'Il tipo di gruppo deve essere uno tra: support, therapy, activity, education, rehabilitation',
      'any.required': 'Il tipo di gruppo è obbligatorio'
    }),

  max_members: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Il numero massimo di membri deve essere un numero',
      'number.integer': 'Il numero massimo di membri deve essere un numero intero',
      'number.min': 'Il numero massimo di membri deve essere almeno 1',
      'number.max': 'Il numero massimo di membri non può superare 100'
    }),

  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .default('active')
    .messages({
      'string.base': 'Lo status deve essere una stringa',
      'any.only': 'Lo status deve essere uno tra: active, inactive, archived'
    }),

  start_date: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'La data di inizio deve essere una data valida',
      'date.format': 'La data di inizio deve essere in formato ISO (YYYY-MM-DD)'
    }),

  end_date: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .min(Joi.ref('start_date'))
    .messages({
      'date.base': 'La data di fine deve essere una data valida',
      'date.format': 'La data di fine deve essere in formato ISO (YYYY-MM-DD)',
      'date.min': 'La data di fine deve essere successiva alla data di inizio'
    }),

  meeting_frequency: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.base': 'La frequenza degli incontri deve essere una stringa',
      'string.max': 'La frequenza degli incontri non può superare 100 caratteri'
    }),

  meeting_location: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Il luogo degli incontri deve essere una stringa',
      'string.max': 'Il luogo degli incontri non può superare 200 caratteri'
    })
});

// Schema per l'aggiornamento dei gruppi (tutti i campi opzionali tranne validazioni)
const groupUpdateSchema = groupSchema.fork(
  ['name', 'group_type'], 
  (schema) => schema.optional()
);

// Schema per la creazione di gruppi con conduttori e membri
const groupCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Il nome deve essere una stringa',
      'string.empty': 'Il nome del gruppo è obbligatorio',
      'string.min': 'Il nome deve avere almeno 2 caratteri',
      'string.max': 'Il nome non può superare 100 caratteri',
      'any.required': 'Il nome del gruppo è obbligatorio'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'La descrizione deve essere una stringa',
      'string.max': 'La descrizione non può superare 1000 caratteri'
    }),

  meeting_frequency: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'La frequenza degli incontri deve essere una stringa',
      'string.empty': 'La frequenza degli incontri è obbligatoria',
      'string.min': 'La frequenza deve avere almeno 2 caratteri',
      'string.max': 'La frequenza degli incontri non può superare 100 caratteri',
      'any.required': 'La frequenza degli incontri è obbligatoria'
    }),

  conductors: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.base': 'I conduttori devono essere un array',
      'array.min': 'Almeno un conduttore è obbligatorio',
      'any.required': 'Almeno un conduttore è obbligatorio'
    }),

  members: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
    .messages({
      'array.base': 'I membri devono essere un array'
    })
});

// Schema per la validazione dei membri
const memberSchema = Joi.object({
  patient_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID paziente deve essere un numero',
      'number.integer': 'L\'ID paziente deve essere un numero intero',
      'number.positive': 'L\'ID paziente deve essere positivo',
      'any.required': 'L\'ID paziente è obbligatorio'
    }),

  member_type: Joi.string()
    .valid('patient', 'psychologist', 'referente', 'observer')
    .default('patient')
    .messages({
      'string.base': 'Il tipo di membro deve essere una stringa',
      'any.only': 'Il tipo di membro deve essere uno tra: patient, psychologist, referente, observer'
    }),

  role: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Il ruolo deve essere una stringa',
      'string.max': 'Il ruolo non può superare 100 caratteri'
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Le note devono essere una stringa',
      'string.max': 'Le note non possono superare 500 caratteri'
    })
});

// Schema per l'aggiornamento dei membri
const memberUpdateSchema = Joi.object({
  member_type: Joi.string()
    .valid('patient', 'psychologist', 'referente', 'observer')
    .optional()
    .messages({
      'string.base': 'Il tipo di membro deve essere una stringa',
      'any.only': 'Il tipo di membro deve essere uno tra: patient, psychologist, referente, observer'
    }),

  role: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Il ruolo deve essere una stringa',
      'string.max': 'Il ruolo non può superare 100 caratteri'
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Le note devono essere una stringa',
      'string.max': 'Le note non possono superare 500 caratteri'
    }),

  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Lo stato attivo deve essere un valore booleano'
    })
});

// Schema per i filtri di ricerca
const groupFiltersSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .optional(),
    
  group_type: Joi.string()
    .valid('support', 'therapy', 'activity', 'education', 'rehabilitation')
    .optional(),
    
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
});

// Middleware di validazione
const validateGroup = (req, res, next) => {
  const { error, value } = groupSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

const validateGroupCreate = (req, res, next) => {
  const { error, value } = groupCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

const validateGroupUpdate = (req, res, next) => {
  const { error, value } = groupUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

const validateMember = (req, res, next) => {
  const { error, value } = memberSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati membro non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

const validateMemberUpdate = (req, res, next) => {
  const { error, value } = memberUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Dati aggiornamento membro non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

const validateGroupFilters = (req, res, next) => {
  const { error, value } = groupFiltersSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Filtri non validi',
      details: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }

  req.query = value;
  next();
};

// Validazione degli ID nei parametri
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID non valido',
      message: 'L\'ID deve essere un numero intero positivo'
    });
  }
  
  req.params.id = parseInt(id);
  next();
};

const validateMemberId = (req, res, next) => {
  const { memberId } = req.params;
  
  if (!memberId || isNaN(parseInt(memberId)) || parseInt(memberId) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID membro non valido',
      message: 'L\'ID del membro deve essere un numero intero positivo'
    });
  }
  
  req.params.memberId = parseInt(memberId);
  next();
};

const validatePatientId = (req, res, next) => {
  const { patientId } = req.params;
  
  if (!patientId || isNaN(parseInt(patientId)) || parseInt(patientId) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID paziente non valido',
      message: 'L\'ID del paziente deve essere un numero intero positivo'
    });
  }
  
  req.params.patientId = parseInt(patientId);
  next();
};

module.exports = {
  validateGroup,
  validateGroupCreate,
  validateGroupUpdate,
  validateMember,
  validateMemberUpdate,
  validateGroupFilters,
  validateId,
  validateMemberId,
  validatePatientId,
  // Export schemas for testing
  groupSchema,
  groupCreateSchema,
  groupUpdateSchema,
  memberSchema,
  memberUpdateSchema,
  groupFiltersSchema
};