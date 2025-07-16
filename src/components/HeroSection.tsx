import React, { useState, useEffect } from 'react';
import { Mic, Play, BarChart3, Globe, Zap, Infinity, Rocket, ChevronDown } from 'lucide-react';
import {AuthModal} from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

interface HeroSectionProps {
  onDashboardClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDashboardClick }) => {
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const { user, loading } = useAuth();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Trigger stats animation when scrolled into view
      if (window.scrollY > 300) {
        setAnimateStats(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Trigger animations on initial load after a delay
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 1000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

 

  const handleStartBuildingClick = () => {
    if (user && onDashboardClick) {
      onDashboardClick();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden pt-24">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        {/* Subtle Gradient Orbs */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-amber-600/10 rounded-full filter blur-3xl"></div>
        
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${scrolled ? 'opacity-90' : 'opacity-100'}`}>
          {/* Logo and Hackathon Badge with improved animation */}
          <div className="flex flex-col items-center justify-center mb-12">
            <div className="relative mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-amber-500 opacity-30 blur-lg rounded-full"></div>
              <Logo size={70} className="relative" />
            </div>
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-amber-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 text-sm font-medium">
              <span className="mr-2 text-amber-400">🏆</span> Built with Bolt for Hackathon 2025
            </div>
          </div>

          {/* Main Headline with improved typography and animation */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-50 mb-8 leading-tight tracking-tight">
            <span className="block mb-2 opacity-0 animate-[fadeInUp_0.6s_0.2s_forwards]">Voice-Powered</span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent inline-block opacity-0 animate-[fadeInUp_0.6s_0.4s_forwards]">
              n8n Automation
            </span>
          </h1>

          {/* Subheadline with improved readability */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[fadeInUp_0.6s_0.6s_forwards]">
            Create sophisticated workflows using just your voice. Describe what you want to automate, 
            and our AI generates, validates, and deploys complete n8n workflows instantly.
          </p>

          {/* CTA Buttons with improved microinteractions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20 opacity-0 animate-[fadeInUp_0.6s_0.8s_forwards]">
            {loading ? (
              // Enhanced loading skeleton
              <div className="w-48 h-14 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl animate-pulse"></div>
            ) : (
              <button 
                onClick={handleStartBuildingClick}
                className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 flex items-center space-x-3 hover:translate-y-[-2px] active:translate-y-0"
                aria-label={user ? 'Go to Dashboard' : 'Start Building'}
              >
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {user ? (
                    <BarChart3 className="w-5 h-5" />
                  ) : (
                    <Rocket className="w-5 h-5" />
                  )}
                </span>
                <span>{user ? 'Go to Dashboard' : 'Start Building'}</span>
              </button>
            )}
            <button 
              className="group border border-slate-600 hover:border-indigo-500/50 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-slate-800/50 backdrop-blur-sm flex items-center space-x-3 hover:translate-y-[-2px] active:translate-y-0"
              aria-label="View Demo"
            >
              <span className="group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5" />
              </span>
              <span>View Demo</span>
            </button>
          </div>

          {/* Stats Row with improved animations and visuals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pb-16">
            <div className={`flex flex-col items-center space-y-3 transition-all duration-700 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '100ms' }}>
              <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-xl rotate-6"></div>
                <div className="absolute inset-0 bg-indigo-500/10 rounded-xl -rotate-6"></div>
                <Globe className="w-8 h-8 text-indigo-400 relative" />
              </div>
              <span className="text-3xl font-bold text-slate-50">29+</span>
              <span className="text-sm font-medium text-slate-400">Languages</span>
            </div>

            <div className={`flex flex-col items-center space-y-3 transition-all duration-700 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
              <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl rotate-6"></div>
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl -rotate-6"></div>
                <Zap className="w-8 h-8 text-amber-400 relative" />
              </div>
              <span className="text-3xl font-bold text-slate-50">AI</span>
              <span className="text-sm font-medium text-slate-400">Powered</span>
            </div>

            <div className={`flex flex-col items-center space-y-3 transition-all duration-700 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '300ms' }}>
              <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl rotate-6"></div>
                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl -rotate-6"></div>
                <Mic className="w-8 h-8 text-emerald-400 relative" />
              </div>
              <span className="text-3xl font-bold text-slate-50">100%</span>
              <span className="text-sm font-medium text-slate-400">Voice-First</span>
            </div>

            <div className={`flex flex-col items-center space-y-3 transition-all duration-700 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
              <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl rotate-6"></div>
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl -rotate-6"></div>
                <Infinity className="w-8 h-8 text-purple-400 relative" />
              </div>
              <span className="text-3xl font-bold text-slate-50">∞</span>
              <span className="text-sm font-medium text-slate-400">Workflows</span>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer opacity-0 animate-[fadeInUp_0.6s_1.2s_forwards]" onClick={scrollToNext}>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm mb-2">Explore More</span>
              <ChevronDown className="w-6 h-6 text-indigo-400 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal - Only show if user is not logged in */}
      {!user && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
         
        />
      )}
    </>
  );
};

export default HeroSection;