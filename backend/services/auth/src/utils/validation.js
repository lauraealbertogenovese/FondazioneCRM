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
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
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
      errors.push('Username is required');
    } else {
      if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      
      if (username.length > 50) {
        errors.push('Username must be less than 50 characters');
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate name fields
  static validateName(name, fieldName = 'Name') {
    const errors = [];
    
    if (!name) {
      errors.push(`${fieldName} is required`);
    } else {
      if (name.length < 2) {
        errors.push(`${fieldName} must be at least 2 characters long`);
      }
      
      if (name.length > 50) {
        errors.push(`${fieldName} must be less than 50 characters`);
      }
      
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
        errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
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
      errors.push('Invalid email format');
    }
    
    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    
    // Validate first name
    const firstNameValidation = this.validateName(data.first_name, 'First name');
    if (!firstNameValidation.isValid) {
      errors.push(...firstNameValidation.errors);
    }
    
    // Validate last name
    const lastNameValidation = this.validateName(data.last_name, 'Last name');
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
    
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
      errors.push('is_active must be a boolean value');
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
