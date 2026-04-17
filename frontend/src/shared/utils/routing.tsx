// Created by CaptainCode - FE-3 Specialist
// Route guards and role-based access control

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/state/auth';
import { UserRole } from '@/shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

/**
 * ProtectedRoute component
 * Protects routes by checking if user is authenticated and has required role
 */
export function ProtectedRoute({ children, requiredRole = [] }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  const bypassAuth = import.meta.env.VITE_AUTH_BYPASS === 'true';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !bypassAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user && bypassAuth) {
    return <>{children}</>;
  }

  if (requiredRole.length > 0 && user && !requiredRole.includes(user.role) && !bypassAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Instructor-only route guard
 */
export function InstructorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={[UserRole.INSTRUCTOR]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin-only route guard
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Instructor or Admin route guard
 */
export function InstructorAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}

export function useRequireRole(...roles: UserRole[]) {
  const { user } = useAuthStore();
  const bypassAuth = import.meta.env.VITE_AUTH_BYPASS === 'true';
  
  if ((!user || !roles.includes(user.role)) && !bypassAuth) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return null;
}
