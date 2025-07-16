import { useState, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  Menu, 
  X,
  ArrowRight,
  MessageSquare,
  Database,
  Globe,
  Heart,
  LogOut,
  BarChart3,
  RefreshCw,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
  Rocket,
  Shield,
  Users
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './pages/Dashboard';
import PricingModal from './components/PricingModal';
import { useAuth } from './hooks/useAuth';
import Logo from './components/Logo';

function App() {
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingRequested, setPricingRequested] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const { user, loading, signOut } = useAuth();

  // Check URL path and set current page
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard' && user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  }, [user]);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'dashboard' && user) {
      window.history.pushState({}, '', '/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage, user]);


  const handleGetStarted = () => {
    if (user) {
      // User is authenticated, go to dashboard
      setCurrentPage('dashboard');
    } else {
      // User is not authenticated, show auth modal
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (pricingRequested) {
      // User wanted pricing, show pricing modal instead of going to dashboard
      setPricingModalOpen(true);
      setPricingRequested(false);
    } else {
      // Normal flow - redirect to dashboard
      setCurrentPage('dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handlePricingClick = () => {
    if (user) {
      // User is authenticated, show pricing modal
      setPricingModalOpen(true);
    } else {
      // User is not authenticated, show auth modal first
      setPricingRequested(true);
      setAuthModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full animate-pulse"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated and on dashboard page
  if (currentPage === 'dashboard' && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-['Inter',sans-serif]">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/30 shadow-xl shadow-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Logo size={36} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">WorkFlow AI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-slate-300 hover:text-white transition-all duration-300 font-medium text-[15px] relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-all duration-300 font-medium text-[15px] relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              
              
              {user ? (
                // Authenticated user menu
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 bg-slate-800/50 rounded-full px-4 py-2 border border-slate-700/50">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 text-sm font-medium truncate max-w-32">{user.email}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-white transition-all duration-200 p-2 hover:bg-slate-800/50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Unauthenticated user
                <button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 border border-slate-700/50 hover:border-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-700/30 bg-slate-900/95 backdrop-blur-xl">
              <div className="px-6 py-8 space-y-6">
                <a href="#features" className="block text-slate-300 hover:text-white transition-all duration-200 py-3 text-lg font-medium border-b border-slate-700/30 hover:border-indigo-500/30">Features</a>
                <a href="#pricing" className="block text-slate-300 hover:text-white transition-all duration-200 py-3 text-lg font-medium border-b border-slate-700/30 hover:border-indigo-500/30">Pricing</a>
                
                {user ? (
                  <div className="space-y-6 pt-6 border-t border-slate-700/30">
                    <div className="flex items-center space-x-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-slate-300 text-sm font-medium">{user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentPage('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-white transition-all duration-200 py-3 hover:bg-slate-800/50 rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 text-lg"
                  >
                    Get Started Free
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-amber-500/5">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
        <div className="absolute top-32 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-48 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Hackathon Badge */}
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-500/20 to-amber-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-full px-8 py-3 mb-12 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/20">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-300 font-semibold text-sm tracking-wide">Built for Bolt.new Hackathon 2025</span>
          </div>

          {/* Enhanced Main Headlines */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] bg-gradient-to-r from-slate-50 via-indigo-200 to-slate-50 bg-clip-text text-transparent">
            Voice-Powered
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent animate-pulse">n8n Automation</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-16 leading-relaxed font-light">
            Create sophisticated workflows using just your voice. Describe what you want to automate, and our AI generates, validates, and deploys complete n8n workflows instantly.
            <span className="text-indigo-300 font-medium"> No coding required.</span>
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button 
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-3xl hover:shadow-indigo-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-3"
            >
              {user ? (
                <BarChart3 className="w-5 h-5" />
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
              <span>{user ? 'Go to Dashboard' : 'Start Building'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="group border-2 border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-slate-800/50 backdrop-blur-sm flex items-center space-x-3">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>View Demo</span>
            </button>
          </div>

          {/* Enhanced Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="group text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
              <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-200 mb-1">29+</div>
              <div className="text-slate-400 text-sm font-medium tracking-wide">Languages</div>
            </div>
            <div className="group text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-200 mb-1">AI</div>
              <div className="text-slate-400 text-sm font-medium tracking-wide">Powered</div>
            </div>
            <div className="group text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-200 mb-1">Voice</div>
              <div className="text-slate-400 text-sm font-medium tracking-wide">First</div>
            </div>
            <div className="group text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <span className="text-3xl text-purple-400 block mb-2">∞</span>
              <div className="text-2xl font-bold text-slate-200 mb-1">Unlimited</div>
              <div className="text-slate-400 text-sm font-medium tracking-wide">Workflows</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Voice Demo Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_50%)] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-amber-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-full px-6 py-2 mb-8">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 text-sm font-medium">Voice Commands</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-50 via-indigo-200 to-slate-50 bg-clip-text text-transparent mb-6">Experience Voice Automation</h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Click the microphone and speak naturally. Our AI understands complex automation requests and 
              <span className="text-amber-300 font-medium"> generates complete workflows</span> instantly.
            </p>
          </div>
          
          

          {/* Enhanced Demo Cards */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Enhanced Voice Input Card */}
            <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-500 hover:bg-slate-800/60">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-indigo-400 text-sm font-bold tracking-wide">VOICE INPUT</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                  <p className="text-slate-200 text-lg leading-relaxed font-medium">
                    "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced AI Response Card */}
            <div className="group bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400/50 transition-all duration-500 shadow-lg shadow-emerald-500/5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-5">
                    <span className="text-emerald-400 text-sm font-bold tracking-wide">AI GENERATED</span>
                    <div className="px-2 py-1 bg-emerald-500/20 rounded-full">
                      <span className="text-emerald-300 text-xs font-medium">2.1s</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-200 font-medium flex-1">Generated 4-node workflow</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <span className="text-slate-200 font-medium flex-1">HubSpot trigger configured</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span className="text-slate-200 font-medium flex-1">Slack integration ready</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.9s'}}></div>
                      <span className="text-slate-200 font-medium flex-1">Ready to deploy</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <div className="text-center mb-24">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-amber-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-indigo-300 text-sm font-medium tracking-wide">Core Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-slate-50 via-indigo-200 to-slate-50 bg-clip-text text-transparent leading-tight">
              Revolutionary Features
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Experience the future of automation with cutting-edge voice AI technology that transforms 
              <span className="text-amber-300 font-medium"> how you build workflows</span>
            </p>
          </div>

          {/* Enhanced Feature Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Enhanced Feature 1 - Voice-First Interface */}
            <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-10 hover:border-indigo-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-slate-50 group-hover:text-indigo-200 transition-colors duration-300">Voice-First Interface</h3>
                  <p className="text-slate-300 leading-relaxed text-lg mb-4">
                    Describe complex workflows naturally in 29+ languages. No coding required, just speak your automation needs and watch them come to life instantly.
                  </p>
                  <div className="flex items-center space-x-2 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">29+ Languages Supported</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Feature 2 - AI-Powered Generation */}
            <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-10 hover:border-amber-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-slate-50 group-hover:text-amber-200 transition-colors duration-300">AI-Powered Generation</h3>
                  <p className="text-slate-300 leading-relaxed text-lg mb-4">
                    WorkFlow AI creates production-ready n8n workflows with proper error handling, data validation, and enterprise-grade security best practices.
                  </p>
                  <div className="flex items-center space-x-2 text-amber-400 group-hover:text-amber-300 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Production-Ready Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Enhanced Feature 3 - Instant Deployment */}
            <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-10 hover:border-emerald-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-slate-50 group-hover:text-emerald-200 transition-colors duration-300">Instant Deployment</h3>
                  <p className="text-slate-300 leading-relaxed text-lg mb-4">
                    Automatically deploy and activate workflows in your n8n instance with one click. Test, validate, and go live in seconds with zero friction.
                  </p>
                  <div className="flex items-center space-x-2 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">One-Click Deployment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Feature 4 - MCP Integration */}
            <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-10 hover:border-purple-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 text-slate-50 group-hover:text-purple-200 transition-colors duration-300">MCP Integration</h3>
                  <p className="text-slate-300 leading-relaxed text-lg mb-4">
                    Connect your Remote MCP Server and unlock advanced development capabilities with seamless n8n workflow integration and real-time synchronization.
                  </p>
                  <div className="flex items-center space-x-2 text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-medium">Enterprise Integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Use Cases Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-amber-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">Success Stories</span>
            </div>
            <h2 className="text-5xl xl:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-50 via-indigo-200 to-slate-50 bg-clip-text text-transparent">
                Real-World 
              </span>
              
              <span className="bg-gradient-to-r from-indigo-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent px-2">
                Use Cases
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover how <span className="text-indigo-400 font-semibold">enterprise teams</span> are revolutionizing their workflows with 
              <span className="text-amber-400 font-semibold">voice-powered automation</span>
            </p>
          </div>

          {/* Enhanced Use Cases Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Use Case 1 - Enhanced */}
            <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-amber-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/10">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                {/* Enhanced Category Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-amber-300">Business Automation</span>
                </div>
                
                {/* Enhanced Title */}
                <h4 className="text-2xl font-bold mb-4 text-slate-50 group-hover:text-amber-100 transition-colors duration-300">
                  Lead Management
                </h4>
                
                {/* Enhanced Voice Command */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-600/50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed italic">
                      "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Generation Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-semibold">Generated in 12 seconds</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">HubSpot + Slack</div>
                </div>
              </div>
            </div>

            {/* Use Case 2 - Enhanced */}
            <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                {/* Enhanced Category Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-indigo-300">Data Integration</span>
                </div>
                
                {/* Enhanced Title */}
                <h4 className="text-2xl font-bold mb-4 text-slate-50 group-hover:text-indigo-100 transition-colors duration-300">
                  Payment Sync
                </h4>
                
                {/* Enhanced Voice Command */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-600/50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed italic">
                      "Import customer data from Stripe to Airtable every hour"
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Generation Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-semibold">Generated in 8 seconds</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Stripe + Airtable</div>
                </div>
              </div>
            </div>

            {/* Use Case 3 - Enhanced */}
             <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-emerald-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
               {/* Card Glow Effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="relative">
                 {/* Enhanced Category Badge */}
                 <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                   <span className="text-sm font-bold text-emerald-300">Content Management</span>
                 </div>
                 
                 {/* Enhanced Title */}
                 <h4 className="text-2xl font-bold mb-4 text-slate-50 group-hover:text-emerald-100 transition-colors duration-300">
                   Social Media
                 </h4>
                 
                 {/* Enhanced Voice Command */}
                 <div className="bg-slate-900/50 backdrop-blur border border-slate-600/50 rounded-xl p-4 mb-6">
                   <div className="flex items-start gap-3">
                     <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                       <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                     </div>
                     <p className="text-slate-300 text-base leading-relaxed italic">
                       "Auto-post Instagram content to Twitter and LinkedIn"
                     </p>
                   </div>
                 </div>
                 
                 {/* Enhanced Generation Time */}
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-emerald-400">
                     <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                       <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                     </div>
                     <span className="text-sm font-semibold">Generated in 15 seconds</span>
                   </div>
                   <div className="text-xs text-slate-500 font-medium">Social Platforms</div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Pricing Section */}
        <section id="pricing" className="relative py-32 overflow-hidden">
          {/* Multi-layer Background System */}
          <div className="absolute inset-0 "></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-amber-500/5"></div>
          
          {/* Animated Background Orbs */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-amber-500/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/5 to-amber-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 backdrop-blur-[1px] bg-slate-900/20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              {/* Premium Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/20 to-amber-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-full px-6 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-300">Enterprise Pricing Plans</span>
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Large-scale Typography */}
              <h2 className="text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-slate-50 via-indigo-100 to-slate-50 bg-clip-text text-transparent leading-tight">
                Simple, Transparent
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">Pricing</span>
              </h2>
              
              {/* Enhanced Copy */}
              <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan for your <span className="text-indigo-400 font-semibold">automation needs</span>. 
                Start free, upgrade when you're ready to <span className="text-amber-400 font-semibold">scale</span>.
              </p>
            </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">$0</div>
                <p className="text-slate-400">Perfect for trying out WorkFlow AI</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">5 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">10 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">n8n platform support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">MCP Integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Community support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Deploy to N8N</span>
                </li>
              </ul>

              <button 
                onClick={handleGetStarted}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                {user ? 'Current Plan' : 'Get Started Free'}
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-2 border-indigo-500/30 rounded-2xl p-8 relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">
                  $19
                  <span className="text-lg font-normal text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For individuals and small teams</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">300 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">500 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">MCP Integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Advanced AI models (Claude Sonnet)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Premium voice features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Email support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">3 team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">MCP Integration</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">
                  $49
                  <span className="text-lg font-normal text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For organizations and power users</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited workflow generations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited voice minutes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">All platforms + custom integrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Premium AI models (Claude Opus)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Custom voice options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Priority support + phone</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">White-label branding</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Full API access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Enterprise dashboard</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Pricing FAQ - Enhanced */}
          <div className="mt-24 text-center relative">
            {/* Background Enhancement */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-amber-500/5 rounded-3xl blur-xl"></div>
            
            {/* Premium Glass Container */}
            <div className="relative ">
              {/* FAQ Header */}
              <div className="mb-12">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/20 to-amber-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-full px-5 py-2 mb-6">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300">Common Questions</span>
                </div>
                
                <h3 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-50 via-indigo-100 to-slate-50 bg-clip-text text-transparent">
                  Frequently Asked
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">Questions</span>
                </h3>
                
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  Everything you need to know about our <span className="text-indigo-400 font-semibold">pricing</span> and <span className="text-amber-400 font-semibold">features</span>
                </p>
              </div>
              
              {/* FAQ Grid */}
              <div className="grid md:grid-cols-2 gap-8 text-left">
                {/* FAQ Item 1 */}
                <div className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-50 text-lg group-hover:text-indigo-200 transition-colors duration-200">What happens when I hit my limits?</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed ml-11">
                    You'll receive a <span className="text-indigo-400 font-semibold">smart notification</span> when approaching limits. Upgrade seamlessly anytime to continue without <span className="text-amber-400 font-semibold">interruption</span>.
                  </p>
                </div>
                
                {/* FAQ Item 2 */}
                <div className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:border-amber-500/40 hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-50 text-lg group-hover:text-amber-200 transition-colors duration-200">Can I change plans anytime?</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed ml-11">
                    <span className="text-emerald-400 font-semibold">Absolutely!</span> Upgrade or downgrade instantly. Changes take effect <span className="text-amber-400 font-semibold">immediately</span> with prorated billing.
                  </p>
                </div>
                
                {/* FAQ Item 3 */}
                <div className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-50 text-lg group-hover:text-emerald-200 transition-colors duration-200">Do you offer yearly discounts?</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed ml-11">
                    <span className="text-emerald-400 font-semibold">Save 2 months</span> with yearly plans! Annual subscribers get <span className="text-indigo-400 font-semibold">priority support</span> and early feature access.
                  </p>
                </div>
                
                {/* FAQ Item 4 */}
                <div className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-50 text-lg group-hover:text-purple-200 transition-colors duration-200">What platforms do you support?</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed ml-11">
                    <span className="text-indigo-400 font-semibold">Free:</span> n8n • <span className="text-amber-400 font-semibold">Pro:</span> n8n, Zapier, Make.com • <span className="text-emerald-400 font-semibold">Enterprise:</span> Custom integrations available.
                  </p>
                </div>
              </div>
              
            
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Enterprise Enhanced */}
      <section className="relative py-32 overflow-hidden">
        
        
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Premium Glass Container */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="">
            
            {/* Premium Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-500/20 to-amber-500/20 border border-indigo-400/30 rounded-full backdrop-blur-sm">
                <Zap className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Transform Your Business Today
                </span>
              </div>
            </div>

            {/* Enhanced Headlines */}
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-slate-50 via-indigo-200 to-amber-200 bg-clip-text text-transparent">
                  Ready to Revolutionize
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                  with Voice AI?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-16 max-w-3xl mx-auto leading-relaxed">
                Join thousands of businesses automating workflows through natural conversations. 
                <span className="text-indigo-300 font-semibold">No coding. No complexity.</span> 
                <span className="text-amber-300 font-semibold">Pure innovation.</span>
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              {/* Primary CTA - Enhanced */}
              <button 
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 flex items-center space-x-3 hover:scale-105 transform w-full md:w-auto justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">{user ? 'Launch Dashboard' : 'Start Free Trial'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
             
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-8 text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">Comming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Logo size={40} />
              <span className="text-xl font-bold text-slate-50">WorkFlow AI</span>
            </div>

            <p className="text-slate-400 mb-4">
              Democratizing automation through the power of voice and AI
            </p>

            <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by Rahees Ahmed for the Bolt.new Hackathon 2025</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}

export default App;