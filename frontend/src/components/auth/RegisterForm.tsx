import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import Alert from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validatePasswordConfirmation 
} from '../../utils/validation';

const RegisterForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();
    
    // Validate all fields
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordConfirmationError = validatePasswordConfirmation(password, passwordConfirmation);
    
    // If there are validation errors, display them and stop
    if (usernameError || emailError || passwordError || passwordConfirmationError) {
      const errors: Record<string, string> = {};
      if (usernameError) errors[usernameError.field] = usernameError.message;
      if (emailError) errors[emailError.field] = emailError.message;
      if (passwordError) errors[passwordError.field] = passwordError.message;
      if (passwordConfirmationError) errors[passwordConfirmationError.field] = passwordConfirmationError.message;
      
      setValidationErrors(errors);
      return;
    }
    
    // Submit the form
    await register(username, email, password);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create an Account</h1>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={clearError}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <FormInput
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          error={validationErrors.username}
          required
        />
        
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          error={validationErrors.email}
          required
        />
        
        <FormInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          required
        />
        
        <FormInput
          id="password-confirmation"
          label="Confirm Password"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          error={validationErrors.passwordConfirmation}
          required
        />
        
        <div className="mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign Up
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;