class ValidationUtils {
  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('La password è obbligatoria');
    } else {
      if (password.length < 8) {
        errors.push('La password deve contenere almeno 8 caratteri');
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push('La password deve contenere almeno una lettera maiuscola');
      }
      
      if (!/[a-z]/.test(password)) {
        errors.push('La password deve contenere almeno una lettera minuscola');
      }
      
      if (!/\d/.test(password)) {
        errors.push('La password deve contenere almeno un numero');
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('La password deve contenere almeno un carattere speciale');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate username
  static validateUsername(username) {
    const errors = [];
    
    if (!username) {
      errors.push('Il nome utente è obbligatorio');
    } else {
      if (username.length < 3) {
        errors.push('Il nome utente deve contenere almeno 3 caratteri');
      }
      
      if (username.length > 50) {
        errors.push('Il nome utente deve contenere meno di 50 caratteri');
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Il nome utente può contenere solo lettere, numeri, underscore e trattini');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate name fields
  static validateName(name, fieldName = 'Nome') {
    const errors = [];
    
    if (!name) {
      errors.push(`${fieldName} è obbligatorio`);
    } else {
      if (name.length < 2) {
        errors.push(`${fieldName} deve contenere almeno 2 caratteri`);
      }
      
      if (name.length > 50) {
        errors.push(`${fieldName} deve contenere meno di 50 caratteri`);
      }
      
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
        errors.push(`${fieldName} può contenere solo lettere, spazi, trattini e apostrofi`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate role ID
  static validateRoleId(roleId) {
    const errors = [];
    
    if (!roleId) {
      errors.push('Role ID is required');
    } else {
      if (!Number.isInteger(Number(roleId)) || Number(roleId) < 1) {
        errors.push('Role ID must be a positive integer');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user registration data
  static validateUserRegistration(data) {
    const errors = [];
    
    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.push(...usernameValidation.errors);
    }
    
    // Validate email
    if (!this.validateEmail(data.email)) {
      errors.push('Formato email non valido');
    }
    
    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    
    // Validate first name
    const firstNameValidation = this.validateName(data.first_name, 'Il nome');
    if (!firstNameValidation.isValid) {
      errors.push(...firstNameValidation.errors);
    }
    
    // Validate last name
    const lastNameValidation = this.validateName(data.last_name, 'Il cognome');
    if (!lastNameValidation.isValid) {
      errors.push(...lastNameValidation.errors);
    }
    
    // Validate role ID if provided
    if (data.role_id) {
      const roleIdValidation = this.validateRoleId(data.role_id);
      if (!roleIdValidation.isValid) {
        errors.push(...roleIdValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user login data
  static validateUserLogin(data) {
    const errors = [];
    
    if (!data.username) {
      errors.push('Username is required');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user update data
  static validateUserUpdate(data) {
    const errors = [];
    
    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (data.first_name) {
      const firstNameValidation = this.validateName(data.first_name, 'First name');
      if (!firstNameValidation.isValid) {
        errors.push(...firstNameValidation.errors);
      }
    }
    
    if (data.last_name) {
      const lastNameValidation = this.validateName(data.last_name, 'Last name');
      if (!lastNameValidation.isValid) {
        errors.push(...lastNameValidation.errors);
      }
    }
    
    if (data.role_id) {
      const roleIdValidation = this.validateRoleId(data.role_id);
      if (!roleIdValidation.isValid) {
        errors.push(...roleIdValidation.errors);
      }
    }
    
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate password change data
  static validatePasswordChange(data) {
    const errors = [];
    
    if (!data.currentPassword) {
      errors.push('Current password is required');
    }
    
    const newPasswordValidation = this.validatePassword(data.newPassword);
    if (!newPasswordValidation.isValid) {
      errors.push(...newPasswordValidation.errors);
    }
    
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      errors.push('New password must be different from current password');
    }
    
    return {
      isValid: errors.length === 0,
      errors
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

module.exports = ValidationUtils;
