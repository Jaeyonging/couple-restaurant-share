import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { GlobalErrorFallback } from './GlobalErrorFallback';

const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <ErrorBoundary
            FallbackComponent={GlobalErrorFallback}
            onReset={() => {

            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default GlobalErrorBoundary;
