import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from './constants';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sports from './pages/Sports';
import SportDetail from './pages/SportDetail';
import Schedule from './pages/Schedule';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import StarPlayers from './pages/StarPlayers';
import Login from './pages/Login';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_GC_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Login route (outside of Layout) */}
            <Route path="/login" element={<Login />} />
            
            {/* Main app routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="sports" element={<Sports />} />
              <Route path="sports/:id" element={<SportDetail />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:id" element={<TeamDetail />} />
              <Route path="star-players" element={<StarPlayers />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              
              {/* Protected admin route */}
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={
                <div className="text-center py-16">
                  <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                  <p className="text-xl text-gray-600">Page not found</p>
                </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
