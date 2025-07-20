/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character (optional)
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Validate username format
 * - Between 3 and 30 characters
 * - Only alphanumeric characters and underscores
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Sanitize a string by removing HTML tags
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/<[^>]*>?/gm, '');
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate user role
 */
export const isValidUserRole = (role: string): boolean => {
  const validRoles = ['READER', 'WRITER', 'ADMIN'];
  return validRoles.includes(role);
};

/**
 * Validate user preferences object
 * Ensures the preferences object has valid keys and values
 */
export const isValidPreferences = (preferences: Record<string, any>): boolean => {
  // Check if preferences is an object
  if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
    return false;
  }
  
  // Define allowed preference keys and their expected types
  const allowedPreferences: Record<string, string> = {
    theme: 'string',
    notifications: 'boolean',
    language: 'string',
    fontSize: 'number',
    // Add more allowed preferences as needed
  };
  
  // Check each key in the preferences object
  for (const key in preferences) {
    // Skip if the key is not in allowedPreferences
    if (!Object.prototype.hasOwnProperty.call(allowedPreferences, key)) {
      continue;
    }
    
    // Check if the value type matches the expected type
    const valueType = typeof preferences[key];
    if (valueType !== allowedPreferences[key]) {
      return false;
    }
  }
  
  return true;
};