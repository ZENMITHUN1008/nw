
import React, { useState } from 'react';
import { Rocket, BookOpen } from 'lucide-react';
import {AuthModal} from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

interface CTASectionProps {
  onDashboardClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onDashboardClick }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const { user, loading } = useAuth();

  const handleGetStartedClick = () => {
    if (user && onDashboardClick) {
      onDashboardClick();
    } else {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size={50} className="mx-auto mb-6" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6">
            Ready to Automate with Your Voice?
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Join the future of automation. No coding required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {loading ? (
              // Loading skeleton for button
              <div className="w-56 h-14 bg-slate-700/50 rounded-xl animate-pulse"></div>
            ) : (
              <button 
                onClick={handleGetStartedClick}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-3 hover:scale-105"
              >
                <Rocket className="w-5 h-5" />
                <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
              </button>
            )}
            
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <BookOpen className="w-5 h-5" />
              <span>View Documentation</span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm mb-4">Trusted by automation enthusiasts worldwide</p>
            <div className="flex items-center justify-center space-x-8 text-slate-500">
              <span>🔒 Enterprise Security</span>
              <span>⚡ 99.9% Uptime</span>
              <span>🌍 Global Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal - Only show if user is not logged in */}
      {!user && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          mode={authMode}
          onModeChange={setAuthMode}
        />
      )}
    </>
  );
};

export default CTASection;
