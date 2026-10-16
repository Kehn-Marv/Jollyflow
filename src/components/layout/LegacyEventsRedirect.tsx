import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** /app/events now lives at /app (My Events). Keep search/filter params. */
export function LegacyEventsRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/app${search}`} replace />;
}