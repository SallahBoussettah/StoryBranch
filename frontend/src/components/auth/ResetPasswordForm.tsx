import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';

const ResetPasswordForm: React.FC = () => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();
    
    // Check if token exists
    if (!token) {
      setValidationErrors({ token: 'Invalid or missing reset token' });
      return;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    const passwordConfirmationError = validatePasswordConfirmation(password, passwordConfirmation);
    
    // If there are validation errors, display them and stop
    if (passwordError || passwordConfirmationError) {
      const errors: Record<string, string> = {};
      if (passwordError) errors[passwordError.field] = passwordError.message;
      if (passwordConfirmationError) errors[passwordConfirmationError.field] = passwordConfirmationError.message;
      
      setValidationErrors(errors);
      return;
    }
    
    // Submit the form
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      // Error is handled by the auth store
    }
  };
  
  if (!token) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <Alert 
          type="error" 
          message="Invalid or missing reset token. Please request a new password reset link."
        />
        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <Alert 
          type="success" 
          message="Your password has been reset successfully! You will be redirected to the login page."
        />
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Go to login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Set New Password</h1>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={clearError}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <FormInput
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          required
        />
        
        <FormInput
          id="password-confirmation"
          label="Confirm New Password"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          error={validationErrors.passwordConfirmation}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Reset Password
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

export default ResetPasswordForm;