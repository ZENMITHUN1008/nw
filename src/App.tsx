
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AuthModal } from './components/AuthModal';
import { ConnectionSetup } from './components/ConnectionSetup';
import { MCPServerManager } from './components/MCPServerManager';
import { ProfilePage } from './components/ProfilePage';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import UseCasesSection from './UseCasesSection';
import TechStackSection from './TechStackSection';
import VoiceDemoSection from './VoiceDemoSection';
import CTASection from './components/CTASection';
import Footer from './Footer';
import { useUser } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';
import { useState, useEffect } from 'react';
import { useN8n } from './hooks/useN8n';
import Dashboard from './pages/Dashboard';
import AIPlayground from './pages/AIPlayground';

const queryClient = new QueryClient();

function App() {
  const user = useUser();
  const { showAuth, setShowAuth } = useAuth();
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [showMCPManager, setShowMCPManager] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { activeConnection } = useN8n();

  useEffect(() => {
    if (user && !activeConnection && !showConnectionSetup) {
      setShowConnectionSetup(true);
    }
  }, [user, activeConnection, showConnectionSetup]);

  if (showConnectionSetup) {
    return (
      <QueryClientProvider client={queryClient}>
        <ConnectionSetup
          onSkip={() => setShowConnectionSetup(false)}
          onSuccess={() => setShowConnectionSetup(false)}
        />
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (showMCPManager) {
    return (
      <QueryClientProvider client={queryClient}>
        <MCPServerManager onBack={() => setShowMCPManager(false)} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (showProfile) {
    return (
      <QueryClientProvider client={queryClient}>
        <ProfilePage onBack={() => setShowProfile(false)} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection 
                  onGetStarted={() => setShowAuth(true)}
                  onOpenMCPManager={() => setShowMCPManager(true)}
                  onOpenProfile={() => setShowProfile(true)}
                />
                <FeaturesSection />
                <UseCasesSection />
                <TechStackSection />
                <VoiceDemoSection />
                <CTASection onGetStarted={() => setShowAuth(true)} />
                <Footer />
              </>
            } />
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/playground" element={
              user ? <AIPlayground /> : <Navigate to="/" replace />
            } />
          </Routes>
          {showAuth && (
            <AuthModal 
              isOpen={showAuth}
              onClose={() => setShowAuth(false)} 
            />
          )}
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
