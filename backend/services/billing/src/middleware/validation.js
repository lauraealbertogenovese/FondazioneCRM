const Joi = require('joi');

// Validate request data
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        errors: errors
      });
    }
    
    next();
  };
};

// Invoice creation schema (following brief requirements)
const createInvoiceSchema = Joi.object({
  patient_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'ID paziente è obbligatorio',
      'number.base': 'ID paziente deve essere un numero',
      'number.positive': 'ID paziente deve essere positivo'
    }),
    
  description: Joi.string().min(5).max(1000).required()
    .messages({
      'any.required': 'Descrizione servizio/trattamento è obbligatoria',
      'string.min': 'Descrizione deve essere di almeno 5 caratteri',
      'string.max': 'Descrizione non può superare 1000 caratteri'
    }),
    
  amount: Joi.number().positive().precision(2).required()
    .messages({
      'any.required': 'Importo è obbligatorio',
      'number.base': 'Importo deve essere un numero',
      'number.positive': 'Importo deve essere positivo'
    }),
    
  payment_method: Joi.string().valid('contanti', 'tracciabile').default('contanti')
    .messages({
      'any.only': 'Modalità di pagamento deve essere "contanti" o "tracciabile"'
    }),
    
  due_days: Joi.number().integer().min(1).max(365).default(30)
    .messages({
      'number.min': 'Giorni scadenza deve essere almeno 1',
      'number.max': 'Giorni scadenza non può superare 365'
    }),
    
  issue_date: Joi.date().max('now').optional()
    .messages({
      'date.max': 'Data emissione non può essere futura'
    })
});

// Invoice update schema
const updateInvoiceStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled').required()
    .messages({
      'any.required': 'Stato è obbligatorio',
      'any.only': 'Stato deve essere: pending, paid, overdue o cancelled'
    }),
    
  payment_date: Joi.date().allow(null).when('status', {
    is: 'paid',
    then: Joi.date().default(() => new Date()),
    otherwise: Joi.date().allow(null).optional()
  }),
  
  payment_notes: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Note pagamento non possono superare 500 caratteri'
    })
});

// Query filters schema
const invoiceFiltersSchema = Joi.object({
  patient: Joi.string().allow('').optional(),
  status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled').allow('').optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().min(Joi.ref('start_date')).optional()
    .messages({
      'date.min': 'Data fine deve essere successiva alla data inizio'
    }),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

module.exports = {
  validate,
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  invoiceFiltersSchema
};