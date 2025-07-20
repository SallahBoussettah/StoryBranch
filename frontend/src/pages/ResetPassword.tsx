import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPassword: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;