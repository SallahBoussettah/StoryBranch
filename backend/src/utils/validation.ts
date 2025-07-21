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

/**
 * Validate story status
 */
export const isValidStoryStatus = (status: string): boolean => {
  const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
  return validStatuses.includes(status);
};

/**
 * Validate story difficulty
 */
export const isValidDifficulty = (difficulty: string): boolean => {
  const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
  return validDifficulties.includes(difficulty);
};

/**
 * Validate story title
 * - Between 3 and 100 characters
 */
export const isValidStoryTitle = (title: string): boolean => {
  return title.length >= 3 && title.length <= 100;
};

/**
 * Validate story description
 * - Between 10 and 1000 characters
 */
export const isValidStoryDescription = (description: string): boolean => {
  return description.length >= 10 && description.length <= 1000;
};

/**
 * Validate story genres
 * - At least one genre
 * - Each genre between 2 and 30 characters
 */
export const isValidStoryGenres = (genres: string[]): boolean => {
  if (!Array.isArray(genres) || genres.length === 0) {
    return false;
  }
  
  return genres.every(genre => genre.length >= 2 && genre.length <= 30);
};

/**
 * Validate node title
 * - Between 1 and 100 characters
 */
export const isValidNodeTitle = (title: string): boolean => {
  return title.length >= 1 && title.length <= 100;
};

/**
 * Validate node content
 * - At least 1 character
 */
export const isValidNodeContent = (content: string): boolean => {
  return content.length >= 1;
};

/**
 * Validate choice text
 * - Between 1 and 200 characters
 */
export const isValidChoiceText = (text: string): boolean => {
  return text.length >= 1 && text.length <= 200;
};

/**
 * Validate story metadata
 */
export const isValidStoryMetadata = (metadata: Record<string, any>): boolean => {
  // Check if metadata is an object
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return false;
  }
  
  // Define allowed metadata keys and their expected types
  const allowedMetadata: Record<string, string> = {
    estimatedReadTime: 'number',
    nodeCount: 'number',
    endingCount: 'number',
    version: 'number',
    // Add more allowed metadata as needed
  };
  
  // Check each key in the metadata object
  for (const key in metadata) {
    // Skip if the key is not in allowedMetadata
    if (!Object.prototype.hasOwnProperty.call(allowedMetadata, key)) {
      continue;
    }
    
    // Check if the value type matches the expected type
    const valueType = typeof metadata[key];
    if (valueType !== allowedMetadata[key]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Validate node metadata
 */
export const isValidNodeMetadata = (metadata: Record<string, any>): boolean => {
  // Check if metadata is an object
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return false;
  }
  
  // Define allowed metadata keys and their expected types
  const allowedMetadata: Record<string, string | string[]> = {
    isStart: 'boolean',
    endingType: ['good', 'bad', 'neutral'],
    // Add more allowed metadata as needed
  };
  
  // Check each key in the metadata object
  for (const key in metadata) {
    // Skip if the key is not in allowedMetadata
    if (!Object.prototype.hasOwnProperty.call(allowedMetadata, key)) {
      continue;
    }
    
    // Check if the value type matches the expected type or is in the allowed values
    const expectedType = allowedMetadata[key];
    if (typeof expectedType === 'string') {
      // Check type
      const valueType = typeof metadata[key];
      if (valueType !== expectedType) {
        return false;
      }
    } else {
      // Check if value is in allowed values
      if (!expectedType.includes(metadata[key])) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Validate story data for creation or update
 * Returns error message if validation fails, otherwise returns undefined
 */
export const validateStoryData = (data: any): string | undefined => {
  // For creation, title and description are required
  if (data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      return 'Title is required and must be a string';
    }
    
    if (!isValidStoryTitle(data.title)) {
      return 'Title must be between 3 and 100 characters';
    }
  }
  
  if (data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string') {
      return 'Description is required and must be a string';
    }
    
    if (!isValidStoryDescription(data.description)) {
      return 'Description must be between 10 and 1000 characters';
    }
  }
  
  // Cover image URL is optional but must be a string if provided
  if (data.coverImageUrl !== undefined && data.coverImageUrl !== null && typeof data.coverImageUrl !== 'string') {
    return 'Cover image URL must be a string';
  }
  
  // Genres are optional but must be an array of strings if provided
  if (data.genres !== undefined) {
    if (!Array.isArray(data.genres)) {
      return 'Genres must be an array';
    }
    
    if (!isValidStoryGenres(data.genres)) {
      return 'Each genre must be between 2 and 30 characters';
    }
  }
  
  // Difficulty is optional but must be valid if provided
  if (data.difficulty !== undefined && !isValidDifficulty(data.difficulty)) {
    return 'Invalid difficulty level';
  }
  
  // Status is optional but must be valid if provided
  if (data.status !== undefined && !isValidStoryStatus(data.status)) {
    return 'Invalid story status';
  }
  
  // Metadata is optional but must be valid if provided
  if (data.metadata !== undefined && !isValidStoryMetadata(data.metadata)) {
    return 'Invalid story metadata';
  }
  
  return undefined;
};

/**
 * Validate node data for creation or update
 * Returns error message if validation fails, otherwise returns undefined
 */
export const validateNodeData = (data: any): string | undefined => {
  // For creation, title and content are required
  if (data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      return 'Title is required and must be a string';
    }
    
    if (!isValidNodeTitle(data.title)) {
      return 'Title must be between 1 and 100 characters';
    }
  }
  
  if (data.content !== undefined) {
    if (!data.content || typeof data.content !== 'string') {
      return 'Content is required and must be a string';
    }
    
    if (!isValidNodeContent(data.content)) {
      return 'Content must not be empty';
    }
  }
  
  // isEnding is optional but must be a boolean if provided
  if (data.isEnding !== undefined && typeof data.isEnding !== 'boolean') {
    return 'isEnding must be a boolean';
  }
  
  // Metadata is optional but must be valid if provided
  if (data.metadata !== undefined && !isValidNodeMetadata(data.metadata)) {
    return 'Invalid node metadata';
  }
  
  // Position coordinates are optional but must be numbers if provided
  if (data.positionX !== undefined && typeof data.positionX !== 'number') {
    return 'positionX must be a number';
  }
  
  if (data.positionY !== undefined && typeof data.positionY !== 'number') {
    return 'positionY must be a number';
  }
  
  return undefined;
};

/**
 * Validate choice data for creation or update
 * Returns error message if validation fails, otherwise returns undefined
 */
export const validateChoiceData = (data: any): string | undefined => {
  // For creation, targetNodeId and text are required
  if (data.targetNodeId === undefined) {
    return 'Target node ID is required';
  }
  
  if (!isValidUUID(data.targetNodeId)) {
    return 'Invalid target node ID format';
  }
  
  if (data.text !== undefined) {
    if (!data.text || typeof data.text !== 'string') {
      return 'Text is required and must be a string';
    }
    
    if (!isValidChoiceText(data.text)) {
      return 'Text must be between 1 and 200 characters';
    }
  }
  
  // Order is optional but must be a number if provided
  if (data.order !== undefined && typeof data.order !== 'number') {
    return 'Order must be a number';
  }
  
  // Conditions is optional but must be an object if provided
  if (data.conditions !== undefined) {
    if (typeof data.conditions !== 'object' || data.conditions === null || Array.isArray(data.conditions)) {
      return 'Conditions must be an object';
    }
  }
  
  return undefined;
};