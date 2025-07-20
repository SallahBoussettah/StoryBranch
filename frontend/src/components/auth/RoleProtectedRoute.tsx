import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;