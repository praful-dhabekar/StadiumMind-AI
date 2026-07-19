import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AICopilot } from './pages/AICopilot';
import { Gates } from './pages/Gates';
import { Incidents } from './pages/Incidents';
import { Volunteers } from './pages/Volunteers';
import { Settings } from './pages/Settings';
import { Simulator } from './pages/Simulator';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Root Application component initializing TanStack Query client, React Router, Error Boundary, and main stadium views.
 *
 * @returns React Root App JSX element
 */
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="copilot" element={<AICopilot />} />
              <Route path="gates" element={<Gates />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="volunteers" element={<Volunteers />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
