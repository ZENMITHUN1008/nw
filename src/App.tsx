
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { AIPlayground } from './pages/AIPlayground';
import { MasterPortal } from './pages/MasterPortal';
import { AuthModal } from './components/AuthModal';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f1f5f9',
            },
          }}
        />
        
        <Routes>
          <Route path="/master" element={<MasterPortal />} />
          {user ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/playground" element={<AIPlayground />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <Route path="*" element={<AuthModal isOpen={true} onClose={() => {}} />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
