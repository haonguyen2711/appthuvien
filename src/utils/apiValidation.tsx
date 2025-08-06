// Validation utilities theo tiêu chuẩn API document
// Tuân theo API_REQUEST_BODY_REFERENCE.md

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
  conditionalRequired?: (data: any) => boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'file';
  enum?: string[];
  unique?: boolean;
  futureDate?: boolean;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Validation rules theo tiêu chuẩn API document
export const API_VALIDATION_RULES = {
  // Authentication validation rules
  register: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "Username must be 3-50 characters, alphanumeric and underscore only"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    },
    password: {
      required: true,
      minLength: 6,
      message: "Password must be at least 6 characters"
    },
    fullName: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: "Full name is required and must be 1-100 characters"
    }
  } as ValidationRules,

  login: {
    username: {
      required: true,
      message: "Username or email is required"
    },
    password: {
      required: true,
      message: "Password is required"
    }
  } as ValidationRules,

  // Profile update validation rules
  updateProfile: {
    fullName: {
      required: false,
      minLength: 1,
      maxLength: 100,
      message: "Full name must be 1-100 characters if provided"
    },
    email: {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address if provided"
    }
  } as ValidationRules,

  // Change password validation rules
  changePassword: {
    oldPassword: {
      required: true,
      message: "Current password is required"
    },
    newPassword: {
      required: true,
      minLength: 6,
      message: "New password must be at least 6 characters"
    }
  } as ValidationRules,

  // Admin - Create user validation rules
  createUser: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      unique: true,
      message: "Username must be 3-50 characters, alphanumeric and underscore only, and unique"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      unique: true,
      message: "Please enter a valid and unique email address"
    },
    password: {
      required: true,
      minLength: 6,
      message: "Password must be at least 6 characters"
    },
    fullName: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: "Full name is required and must be 1-100 characters"
    },
    role: {
      required: true,
      enum: ['STANDARD', 'VIP', 'ADMIN'],
      message: "Role must be one of: STANDARD, VIP, ADMIN"
    },
    isActive: {
      required: false,
      type: 'boolean',
      message: "isActive must be a boolean value"
    },
    vipExpiresAt: {
      required: false,
      conditionalRequired: (data) => data.role === 'VIP',
      type: 'date',
      futureDate: true,
      message: "VIP expiration date is required when role is VIP"
    }
  } as ValidationRules,

  // Admin - Update user role validation rules
  updateRole: {
    role: {
      required: true,
      enum: ['STANDARD', 'VIP', 'ADMIN'],
      message: "Role must be one of: STANDARD, VIP, ADMIN"
    },
    vipExpiresAt: {
      required: false,
      conditionalRequired: (data) => data.role === 'VIP',
      type: 'date',
      futureDate: true,
      message: "VIP expiration date is required when role is VIP and must be a future date"
    }
  } as ValidationRules,

  // Book upload validation rules  
  uploadBook: {
    title: {
      required: true,
      minLength: 1,
      maxLength: 200,
      message: "Book title is required and must be 1-200 characters"
    },
    author: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: "Author name is required and must be 1-100 characters"
    },
    description: {
      required: false,
      maxLength: 1000,
      message: "Book description must not exceed 1000 characters"
    },
    file: {
      required: true,
      type: 'file',
      message: "PDF file is required"
    }
  } as ValidationRules,

  // Book update validation rules
  updateBook: {
    title: {
      required: false,
      minLength: 1,
      maxLength: 200,
      message: "Title must be 1-200 characters if provided"
    },
    author: {
      required: false,
      minLength: 1,
      maxLength: 100,
      message: "Author must be 1-100 characters if provided"
    },
    description: {
      required: false,
      maxLength: 1000,
      message: "Description must not exceed 1000 characters"
    }
  } as ValidationRules
};

// Validation function
export const validateData = (data: any, rules: ValidationRules): ValidationResult => {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];

    // Check required field
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.message;
      return;
    }

    // Check conditional required
    if (rule.conditionalRequired && rule.conditionalRequired(data)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = rule.message;
        return;
      }
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return;
    }

    // Check string length
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message;
        return;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message;
        return;
      }
    }

    // Check pattern
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[field] = rule.message;
      return;
    }

    // Check enum values
    if (rule.enum && !rule.enum.includes(value)) {
      errors[field] = rule.message;
      return;
    }

    // Check type
    if (rule.type) {
      switch (rule.type) {
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors[field] = rule.message;
            return;
          }
          break;
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors[field] = rule.message;
            return;
          }
          break;
        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors[field] = rule.message;
            return;
          }
          // Check future date if required
          if (rule.futureDate && date <= new Date()) {
            errors[field] = rule.message;
            return;
          }
          break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper function để validate theo endpoint cụ thể
export const validateApiRequest = (endpoint: string, data: any): ValidationResult => {
  switch (endpoint) {
    case 'auth/register':
      return validateData(data, API_VALIDATION_RULES.register);
    case 'auth/login':
      return validateData(data, API_VALIDATION_RULES.login);
    case 'users/profile':
      return validateData(data, API_VALIDATION_RULES.updateProfile);
    case 'users/change-password':
      return validateData(data, API_VALIDATION_RULES.changePassword);
    case 'users/manage/create':
      return validateData(data, API_VALIDATION_RULES.createUser);
    case 'users/manage/role':
      return validateData(data, API_VALIDATION_RULES.updateRole);
    case 'books/upload':
      return validateData(data, API_VALIDATION_RULES.uploadBook);
    case 'books/update':
      return validateData(data, API_VALIDATION_RULES.updateBook);
    default:
      return { isValid: true, errors: {} };
  }
};

// Helper function để format validation errors cho UI
export const formatValidationErrors = (errors: { [key: string]: string }): string => {
  return Object.values(errors).join('\n');
};

// Helper function để kiểm tra email/username format
export const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// Helper function để kiểm tra file size (cho mobile)
export const validateFileSize = (file: any, maxSizeInMB: number = 100): boolean => {
  if (!file || !file.size) return true; // Allow if no file or size info
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Helper function để kiểm tra file type
export const validateFileType = (file: any, allowedTypes: string[] = ['application/pdf']): boolean => {
  if (!file || !file.type) return true; // Allow if no file or type info
  return allowedTypes.includes(file.type);
};
