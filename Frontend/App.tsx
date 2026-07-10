import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

type Page = 'landing' | 'login' | 'register' | 'forgot' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPage('dashboard');
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setPage('dashboard');
      } else {
        setPage((prev) => (prev === 'dashboard' ? 'landing' : prev));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Loading DSTA...</p>
        </div>
      </div>
    );
  }

  if (page === 'dashboard') {
    return <Dashboard onSignOut={() => setPage('landing')} />;
  }

  if (page === 'login') {
    return <AuthPage mode="login" onNavigate={setPage} onAuthSuccess={() => setPage('dashboard')} />;
  }

  if (page === 'register') {
    return <AuthPage mode="register" onNavigate={setPage} onAuthSuccess={() => setPage('dashboard')} />;
  }

  if (page === 'forgot') {
    return <AuthPage mode="forgot" onNavigate={setPage} onAuthSuccess={() => setPage('dashboard')} />;
  }

  return <LandingPage onNavigate={setPage} />;
}
