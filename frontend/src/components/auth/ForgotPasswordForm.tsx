import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import Alert from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();
    
    // Validate email
    const emailError = validateEmail(email);
    
    // If there are validation errors, display them and stop
    if (emailError) {
      setValidationErrors({ [emailError.field]: emailError.message });
      return;
    }
    
    // Submit the form
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the auth store
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <Alert 
          type="success" 
          message="If an account exists with this email, you will receive password reset instructions shortly."
        />
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Return to login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reset Your Password</h1>
      
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
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
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;