import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRequireRole } from '../../hooks/useAuth';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  allowedRoles, 
  redirectTo = '/' 
}) => {
  const { user, isAuthenticated, isLoading } = useRequireRole(allowedRoles, redirectTo);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case-insensitive role check
  const isRoleAllowed = allowedRoles.some(role => 
    role.toUpperCase() === user.role.toUpperCase()
  );
  
  if (!isRoleAllowed) {
    console.log('User role not allowed, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;