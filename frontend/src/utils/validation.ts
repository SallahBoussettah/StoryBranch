export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return { 
      field: 'password', 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return null;
};

export const validateUsername = (username: string): ValidationError | null => {
  if (!username) {
    return { field: 'username', message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { field: 'username', message: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { field: 'username', message: 'Username must be less than 20 characters long' };
  }
  
  // Only allow alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { field: 'username', message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): ValidationError | null => {
  if (!confirmation) {
    return { field: 'passwordConfirmation', message: 'Please confirm your password' };
  }
  
  if (password !== confirmation) {
    return { field: 'passwordConfirmation', message: 'Passwords do not match' };
  }
  
  return null;
};