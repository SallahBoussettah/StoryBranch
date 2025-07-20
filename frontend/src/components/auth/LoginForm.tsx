import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, type ValidationError } from '../../utils/validation';

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();
    
    // Validate email
    const emailError = validateEmail(email);
    
    // Validate password (simple check for emptiness)
    let passwordError: ValidationError | null = null;
    if (!password) {
      passwordError = { field: 'password', message: 'Password is required' };
    }
    
    // If there are validation errors, display them and stop
    if (emailError || passwordError) {
      const errors: Record<string, string> = {};
      if (emailError) errors[emailError.field] = emailError.message;
      if (passwordError) errors[passwordError.field] = passwordError.message;
      
      setValidationErrors(errors);
      return;
    }
    
    // Submit the form
    await login(email, password);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Log In</h1>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={clearError}
        />
      )}
      
      <form onSubmit={handleSubmit}>
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
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Log In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;