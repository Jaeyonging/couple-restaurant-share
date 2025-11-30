import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ApiErrorFallback } from './ApiErrorFallback';

const ApiErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary 
      FallbackComponent={ApiErrorFallback} 
      onReset={() => {
       
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ApiErrorBoundary;
