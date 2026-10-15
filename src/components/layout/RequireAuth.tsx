import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  allowUnonboarded?: boolean;
}

export function RequireAuth({ children, allowUnonboarded }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!user.onboarded && !allowUnonboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}