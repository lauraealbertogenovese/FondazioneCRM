class PatientValidationUtils {
  // Validate Codice Fiscale (Italian tax code)
  static validateCodiceFiscale(cf) {
    const errors = [];
    
    if (!cf) {
      errors.push('Codice Fiscale is required');
    } else {
      // Remove spaces and convert to uppercase
      const cleanCf = cf.replace(/\s/g, '').toUpperCase();
      
      if (cleanCf.length !== 16) {
        errors.push('Codice Fiscale must be exactly 16 characters');
      }
      
      // Check format: 6 letters, 2 numbers, 1 letter, 2 numbers, 1 letter, 3 numbers, 1 letter
      const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
      if (!cfRegex.test(cleanCf)) {
        errors.push('Invalid Codice Fiscale format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      cleaned: cf ? cf.replace(/\s/g, '').toUpperCase() : null
    };
  }

  // Validate Numero Tessera Sanitaria
  static validateNumeroTesseraSanitaria(ts, isRequired = true) {
    const errors = [];
    
    if (!ts || ts.trim() === '') {
      if (isRequired) {
        errors.push('Numero Tessera Sanitaria is required');
      }
    } else {
      // Remove spaces and convert to uppercase
      const cleanTs = ts.replace(/\s/g, '').toUpperCase();
      
      if (cleanTs.length !== 20) {
        errors.push('Numero Tessera Sanitaria must be exactly 20 characters');
      }
      
      // Check format: 20 alphanumeric characters
      const tsRegex = /^[A-Z0-9]{20}$/;
      if (!tsRegex.test(cleanTs)) {
        errors.push('Invalid Numero Tessera Sanitaria format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      cleaned: ts ? ts.replace(/\s/g, '').toUpperCase() : null
    };
  }

  // Validate name fields
  static validateName(name, fieldName = 'Name') {
    const errors = [];
    
    if (!name || name.trim() === '') {
      errors.push(`${fieldName} is required`);
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        errors.push(`${fieldName} must be at least 2 characters long`);
      }
      
      if (trimmedName.length > 50) {
        errors.push(`${fieldName} must be less than 50 characters`);
      }
      
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
        errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate date of birth
  static validateDataNascita(dataNascita) {
    const errors = [];
    
    if (!dataNascita || dataNascita.trim() === '') {
      errors.push('Data di nascita is required');
    } else {
      const birthDate = new Date(dataNascita);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        errors.push('Invalid date format');
      } else if (birthDate > today) {
        errors.push('Data di nascita cannot be in the future');
      } else if (birthDate < new Date('1900-01-01')) {
        errors.push('Data di nascita cannot be before 1900');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate sex
  static validateSesso(sesso) {
    const errors = [];
    
    if (!sesso || sesso.trim() === '') {
      errors.push('Sesso is required');
    } else if (!['M', 'F', 'Altro'].includes(sesso)) {
      errors.push('Sesso must be M, F, or Altro');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email
  static validateEmail(email) {
    const errors = [];
    
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate phone number
  static validateTelefono(telefono) {
    const errors = [];
    
    if (telefono && telefono.trim() !== '') {
      // Italian phone number validation
      const phoneRegex = /^(\+39|0039|39)?[\s]?[0-9]{2,3}[\s]?[0-9]{6,7}$/;
      if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate CAP (Italian postal code)
  static validateCAP(cap) {
    const errors = [];
    
    if (cap && cap.trim() !== '') {
      const capRegex = /^[0-9]{5}$/;
      if (!capRegex.test(cap)) {
        errors.push('CAP must be 5 digits');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate patient creation data
  static validatePatientCreation(data) {
    const errors = [];
    
    // Validate required fields
    const cfValidation = this.validateCodiceFiscale(data.codice_fiscale);
    if (!cfValidation.isValid) {
      errors.push(...cfValidation.errors);
    }
    
    const tsValidation = this.validateNumeroTesseraSanitaria(data.numero_tessera_sanitaria, false); // Not required
    if (!tsValidation.isValid) {
      errors.push(...tsValidation.errors);
    }
    
    const nomeValidation = this.validateName(data.nome, 'Nome');
    if (!nomeValidation.isValid) {
      errors.push(...nomeValidation.errors);
    }
    
    const cognomeValidation = this.validateName(data.cognome, 'Cognome');
    if (!cognomeValidation.isValid) {
      errors.push(...cognomeValidation.errors);
    }
    
    const dataNascitaValidation = this.validateDataNascita(data.data_nascita);
    if (!dataNascitaValidation.isValid) {
      errors.push(...dataNascitaValidation.errors);
    }
    
    const sessoValidation = this.validateSesso(data.sesso);
    if (!sessoValidation.isValid) {
      errors.push(...sessoValidation.errors);
    }
    
    // Validate optional fields
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
    
    const telefonoValidation = this.validateTelefono(data.telefono);
    if (!telefonoValidation.isValid) {
      errors.push(...telefonoValidation.errors);
    }
    
    const capValidation = this.validateCAP(data.cap);
    if (!capValidation.isValid) {
      errors.push(...capValidation.errors);
    }
    
    // Validate consensi
    if (data.consenso_trattamento_dati !== true) {
      errors.push('Consenso trattamento dati is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      cleaned: {
        codice_fiscale: cfValidation.cleaned,
        numero_tessera_sanitaria: tsValidation.cleaned
      }
    };
  }

  // Validate patient update data
  static validatePatientUpdate(data) {
    const errors = [];
    
    // Validate fields if provided and not empty
    if (data.codice_fiscale !== undefined && data.codice_fiscale !== null && data.codice_fiscale.trim() !== '') {
      const cfValidation = this.validateCodiceFiscale(data.codice_fiscale);
      if (!cfValidation.isValid) {
        errors.push(...cfValidation.errors);
      }
    }
    
    // For updates, handle Numero Tessera Sanitaria properly
    // Convert empty strings to null to avoid uniqueness constraint violations
    if (data.numero_tessera_sanitaria !== undefined) {
      if (data.numero_tessera_sanitaria === null || data.numero_tessera_sanitaria === '' || data.numero_tessera_sanitaria.trim() === '') {
        // Allow empty values by converting to null
        data.numero_tessera_sanitaria = null;
      } else {
        // Only validate if it looks like a proper Numero Tessera Sanitaria (20 chars)
        // Skip validation for existing invalid data (like Codice Fiscale copied to this field)
        if (data.numero_tessera_sanitaria.length === 20) {
          const tsValidation = this.validateNumeroTesseraSanitaria(data.numero_tessera_sanitaria, false);
          if (!tsValidation.isValid) {
            errors.push(...tsValidation.errors);
          }
        }
      }
    }
    
    if (data.nome !== undefined && data.nome !== null) {
      const nomeValidation = this.validateName(data.nome, 'Nome');
      if (!nomeValidation.isValid) {
        errors.push(...nomeValidation.errors);
      }
    }
    
    if (data.cognome !== undefined && data.cognome !== null) {
      const cognomeValidation = this.validateName(data.cognome, 'Cognome');
      if (!cognomeValidation.isValid) {
        errors.push(...cognomeValidation.errors);
      }
    }
    
    if (data.data_nascita !== undefined && data.data_nascita !== null) {
      const dataNascitaValidation = this.validateDataNascita(data.data_nascita);
      if (!dataNascitaValidation.isValid) {
        errors.push(...dataNascitaValidation.errors);
      }
    }
    
    if (data.sesso !== undefined && data.sesso !== null) {
      const sessoValidation = this.validateSesso(data.sesso);
      if (!sessoValidation.isValid) {
        errors.push(...sessoValidation.errors);
      }
    }
    
    if (data.email !== undefined && data.email !== null) {
      const emailValidation = this.validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }
    
    if (data.telefono !== undefined && data.telefono !== null) {
      const telefonoValidation = this.validateTelefono(data.telefono);
      if (!telefonoValidation.isValid) {
        errors.push(...telefonoValidation.errors);
      }
    }
    
    if (data.cap !== undefined && data.cap !== null) {
      const capValidation = this.validateCAP(data.cap);
      if (!capValidation.isValid) {
        errors.push(...capValidation.errors);
      }
    }

    // Validate is_active if provided
    if (data.is_active !== undefined && data.is_active !== null) {
      if (typeof data.is_active !== 'boolean') {
        errors.push('is_active deve essere un valore booleano (true/false)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      cleaned: {
        codice_fiscale: data.codice_fiscale && data.codice_fiscale.trim() !== '' ? this.validateCodiceFiscale(data.codice_fiscale).cleaned : null,
        numero_tessera_sanitaria: data.numero_tessera_sanitaria && data.numero_tessera_sanitaria !== null && data.numero_tessera_sanitaria.trim() !== '' ? this.validateNumeroTesseraSanitaria(data.numero_tessera_sanitaria, false).cleaned : null
      }
    };
  }

  // Sanitize input data
  static sanitizeInput(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove leading/trailing whitespace
        sanitized[key] = value.trim();
        
        // Remove potentially dangerous characters
        sanitized[key] = sanitized[key].replace(/[<>]/g, '');
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

module.exports = PatientValidationUtils;
