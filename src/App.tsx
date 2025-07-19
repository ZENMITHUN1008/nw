
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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
  Users,
  Bot
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './pages/Dashboard';
import PricingModal from './components/PricingModal';
import { useAuth } from './hooks/useAuth';
import Logo from './components/Logo';

// Utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Aurora Background Component
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  showRadialGradient?: boolean;
}

const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center text-white transition-bg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </main>
  );
};

// Background Pattern Component
type BGVariantType = 'dots' | 'grid';
type BGMaskType = 'fade-center' | 'fade-edges' | 'none';

interface BGPatternProps extends React.ComponentProps<'div'> {
  variant?: BGVariantType;
  mask?: BGMaskType;
  size?: number;
  fill?: string;
}

const maskClasses: Record<BGMaskType, string> = {
  'fade-edges': '[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]',
  'fade-center': '[mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]',
  'none': '',
};

function getBgImage(variant: BGVariantType, fill: string, size: number) {
  switch (variant) {
    case 'dots':
      return `radial-gradient(${fill} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    default:
      return undefined;
  }
}

const BGPattern = ({
  variant = 'grid',
  mask = 'none',
  size = 24,
  fill = '#252525',
  className,
  style,
  ...props
}: BGPatternProps) => {
  const bgSize = `${size}px ${size}px`;
  const backgroundImage = getBgImage(variant, fill, size);
  
  return (
    <div
      className={cn('absolute inset-0 z-[-10] size-full', maskClasses[mask], className)}
      style={{
        backgroundImage,
        backgroundSize: bgSize,
        ...style,
      }}
      {...props}
    />
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lightSize = 100;
  const lightX = useTransform(x, (value) => value - lightSize / 2);
  const lightY = useTransform(y, (value) => value - lightSize / 2);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BGPattern variant="dots" mask="fade-edges" size={20} fill="#ffffff10" />
      
      {isHovered && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: lightSize,
            height: lightSize,
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)',
            x: lightX,
            y: lightY,
          }}
        />
      )}
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingRequested, setPricingRequested] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const { user, loading, signOut } = useAuth();

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes aurora {
        0% {
          background-position: 0% 0%, 0% 0%;
          transform: translateX(-20px) translateY(0px);
        }
        25% {
          background-position: 25% 15%, 15% 25%;
          transform: translateX(-10px) translateY(25px);
        }
        50% {
          background-position: 50% 30%, 30% 50%;
          transform: translateX(0px) translateY(50px);
        }
        75% {
          background-position: 75% 45%, 45% 75%;
          transform: translateX(10px) translateY(75px);
        }
        100% {
          background-position: 100% 60%, 60% 100%;
          transform: translateX(20px) translateY(100px);
        }
      }
      
      @keyframes aurora-secondary {
        0% {
          background-position: 100% 0%, 0% 50%;
          transform: translateX(-15px) translateY(0px) scale(1);
        }
        33% {
          background-position: 67% 33%, 33% 83%;
          transform: translateX(-5px) translateY(35px) scale(1.01);
        }
        66% {
          background-position: 33% 66%, 66% 116%;
          transform: translateX(5px) translateY(70px) scale(0.99);
        }
        100% {
          background-position: 0% 100%, 100% 150%;
          transform: translateX(15px) translateY(105px) scale(1);
        }
      }
      
      .animate-aurora {
        animation: aurora 35s ease-in-out infinite;
      }
      
      .animate-aurora-secondary {
        animation: aurora-secondary 28s ease-in-out infinite reverse;
      }
      
      :root {
        --white: #ffffff;
        --black: #000000;
        --transparent: transparent;
        --dark-blue: #0f172a;
        --dark-gray: #1e293b;
        --charcoal: #334155;
        --dark-slate: #475569;
        --background: #000000;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      setCurrentPage('dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (pricingRequested) {
      setPricingModalOpen(true);
      setPricingRequested(false);
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handlePricingClick = () => {
    if (user) {
      setPricingModalOpen(true);
    } else {
      setPricingRequested(true);
      setAuthModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white/60">
          <div className="w-6 h-6 bg-gradient-to-br from-white/50 to-white/20 rounded-full animate-pulse"></div>
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Global Moving Background */}
      <div className="fixed inset-0 z-0">
        <div
          className={cn(
            `[--white-gradient:repeating-linear-gradient(165deg,var(--white)_0%,var(--white)_2%,var(--transparent)_4%,var(--transparent)_6%,var(--white)_8%)]
            [--dark-gradient:repeating-linear-gradient(165deg,var(--black)_0%,var(--black)_2%,var(--dark-gray)_4%,var(--dark-gray)_6%,var(--black)_8%)]
            [--aurora:repeating-linear-gradient(165deg,var(--dark-blue)_3%,var(--dark-gray)_6%,var(--charcoal)_9%,var(--dark-slate)_12%,var(--black)_15%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:100%_200%,100%_160%]
            [background-position:0%_0%,0%_0%]
            filter blur-[6px] invert-0
            animate-aurora
            pointer-events-none
            absolute inset-0 opacity-70 will-change-transform`
          )}
        ></div>
        <div
          className={cn(
            `[--aurora-alt:repeating-linear-gradient(170deg,var(--charcoal)_0%,var(--dark-slate)_5%,var(--dark-gray)_10%,var(--black)_15%,var(--charcoal)_20%)]
            [--dark-alt:repeating-linear-gradient(170deg,var(--black)_0%,var(--black)_3%,var(--dark-gray)_6%,var(--dark-gray)_9%,var(--black)_12%)]
            [background-image:var(--dark-alt),var(--aurora-alt)]
            [background-size:100%_180%,100%_140%]
            [background-position:0%_0%,0%_50%]
            filter blur-[8px] invert-0
            animate-aurora-secondary
            pointer-events-none
            absolute inset-0 opacity-50 will-change-transform mix-blend-multiply`
          )}
        ></div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-2rem)] max-w-6xl px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
          <div className="transition-transform duration-300 group-hover:scale-105">
            <Logo size={32} />
          </div>
          <span className="text-xl font-bold text-white">WorkFlow AI</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">Features</a>
          <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm">Pricing</a>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium truncate max-w-32">{user.email}</span>
              </div>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-xl font-semibold transition-all duration-200"
              >
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="text-white/60 hover:text-white transition-all duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGetStarted}
                className="text-white/80 hover:text-white border border-white/20 hover:bg-white/10 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-xl font-semibold transition-all duration-200 text-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:hidden">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              
              {user ? (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-sm font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-black hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-white/60 hover:text-white transition-all duration-200 py-3 hover:bg-white/10 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-white/80 hover:text-white border border-white/20 hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-black hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <AuroraBackground className="min-h-screen pt-32">
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 mb-12">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <Zap className="w-5 h-5 text-white/80" />
              <span className="text-white/90 font-semibold text-sm tracking-wide">Built for Bolt.new Hackathon 2025</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Voice-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-white/80 via-white/60 to-white/40 bg-clip-text text-transparent">
                n8n Automation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-16">
              Create sophisticated workflows using just your voice. Describe what you want to automate, and our AI generates, validates, and deploys complete n8n workflows instantly.
              <span className="text-white/90 font-medium"> No coding required.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-black hover:bg-white/90 px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center space-x-3 hover:scale-105 transform"
              >
                {user ? (
                  <BarChart3 className="w-5 h-5" />
                ) : (
                  <BarChart3 className="w-5 h-5" />
                )}
                <span>{user ? 'Go to Dashboard' : 'Start Building'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-white/30 hover:border-white/50 text-white hover:bg-white/10 px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center space-x-3">
                <Play className="w-5 h-5" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                <Globe className="w-8 h-8 text-white/70 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">29+</div>
                <div className="text-white/60 text-sm font-medium">Languages</div>
              </div>
              <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                <Sparkles className="w-8 h-8 text-white/70 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">AI</div>
                <div className="text-white/60 text-sm font-medium">Powered</div>
              </div>
              <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                <MessageSquare className="w-8 h-8 text-white/70 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">Voice</div>
                <div className="text-white/60 text-sm font-medium">First</div>
              </div>
              <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                <span className="text-3xl text-white/70 block mb-2">∞</span>
                <div className="text-2xl font-bold text-white mb-1">Unlimited</div>
                <div className="text-white/60 text-sm font-medium">Workflows</div>
              </div>
            </div>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* Voice Demo Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <Mic className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium">Voice Commands</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Experience Voice Automation</h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Click the microphone and speak naturally. Our AI understands complex automation requests and 
              <span className="text-white/90 font-medium"> generates complete workflows</span> instantly.
            </p>
          </motion.div>
          
          {/* Demo Cards */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Voice Input Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-white/80 text-sm font-bold tracking-wide">VOICE INPUT</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                  <p className="text-white text-lg leading-relaxed font-medium">
                    "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Response Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-5">
                    <span className="text-white/80 text-sm font-bold tracking-wide">AI GENERATED</span>
                    <div className="px-2 py-1 bg-white/20 rounded-full">
                      <span className="text-white/90 text-xs font-medium">2.1s</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-xl border border-white/10">
                      <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium flex-1">Generated 4-node workflow</span>
                      <CheckCircle className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-xl border border-white/10">
                      <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <span className="text-white font-medium flex-1">HubSpot trigger configured</span>
                      <CheckCircle className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-xl border border-white/10">
                      <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span className="text-white font-medium flex-1">Slack integration ready</span>
                      <CheckCircle className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-xl border border-white/10">
                      <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.9s'}}></div>
                      <span className="text-white font-medium flex-1">Ready to deploy</span>
                      <CheckCircle className="w-4 h-4 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">Core Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Revolutionary Features
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Experience the future of automation with cutting-edge voice AI technology that transforms 
              <span className="text-white/90 font-medium"> how you build workflows</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <FeatureCard
              icon={<Mic className="w-6 h-6 text-white" />}
              title="Voice-First Interface"
              description="Describe complex workflows naturally in 29+ languages. No coding required, just speak your automation needs and watch them come to life instantly."
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-white" />}
              title="AI-Powered Generation"
              description="WorkFlow AI creates production-ready n8n workflows with proper error handling, data validation, and enterprise-grade security best practices."
              delay={0.2}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-white" />}
              title="Instant Deployment"
              description="Automatically deploy and activate workflows in your n8n instance with one click. Test, validate, and go live in seconds with zero friction."
              delay={0.3}
            />
            <FeatureCard
              icon={<Database className="w-6 h-6 text-white" />}
              title="MCP Integration"
              description="Connect your Remote MCP Server and unlock advanced development capabilities with seamless n8n workflow integration and real-time synchronization."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Real-World Use Cases
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Discover how <span className="text-white/90 font-semibold">enterprise teams</span> are revolutionizing their workflows with 
              <span className="text-white/90 font-semibold">voice-powered automation</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white/90">Business Automation</span>
              </div>
              
              <h4 className="text-2xl font-bold mb-4 text-white">
                Lead Management
              </h4>
              
              <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-white/80 text-base leading-relaxed italic">
                    "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-4 h-4 bg-white/60 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-sm font-semibold">Generated in 12 seconds</span>
                </div>
                <div className="text-xs text-white/50 font-medium">HubSpot + Slack</div>
              </div>
            </motion.div>

            {/* Use Case 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white/90">Data Integration</span>
              </div>
              
              <h4 className="text-2xl font-bold mb-4 text-white">
                Payment Sync
              </h4>
              
              <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-white/80 text-base leading-relaxed italic">
                    "Import customer data from Stripe to Airtable every hour"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-4 h-4 bg-white/60 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-sm font-semibold">Generated in 8 seconds</span>
                </div>
                <div className="text-xs text-white/50 font-medium">Stripe + Airtable</div>
              </div>
            </motion.div>

            {/* Use Case 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white/90">Content Management</span>
              </div>
              
              <h4 className="text-2xl font-bold mb-4 text-white">
                Social Media
              </h4>
              
              <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-white/80 text-base leading-relaxed italic">
                    "Auto-post Instagram content to Twitter and LinkedIn"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-4 h-4 bg-white/60 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-sm font-semibold">Generated in 15 seconds</span>
                </div>
                <div className="text-xs text-white/50 font-medium">Social Platforms</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-sm font-semibold text-white/90">Enterprise Pricing Plans</span>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Simple, Transparent Pricing
            </h2>
            
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your <span className="text-white/90 font-semibold">automation needs</span>. 
              Start free, upgrade when you're ready to <span className="text-white/90 font-semibold">scale</span>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-white/60">Perfect for trying out WorkFlow AI</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">5 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">10 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">n8n platform support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">MCP Integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Community support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Deploy to N8N</span>
                </li>
              </ul>

              <button 
                onClick={handleGetStarted}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 border border-white/20"
              >
                {user ? 'Current Plan' : 'Get Started Free'}
              </button>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 relative"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $19
                  <span className="text-lg font-normal text-white/60">/month</span>
                </div>
                <p className="text-white/60">For individuals and small teams</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">300 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">500 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">MCP Integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Advanced AI models (Claude Sonnet)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Premium voice features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Email support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">3 team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">MCP Integration</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-white text-black hover:bg-white/90 py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                Upgrade to Pro
              </button>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $49
                  <span className="text-lg font-normal text-white/60">/month</span>
                </div>
                <p className="text-white/60">For organizations and power users</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Unlimited workflow generations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Unlimited voice minutes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">All platforms + custom integrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Premium AI models (Claude Opus)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Custom voice options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Priority support + phone</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">White-label branding</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Unlimited team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Full API access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <span className="text-white/80">Enterprise dashboard</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 border border-white/20"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>

          {/* Pricing FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 text-center relative"
          >
            <div className="mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
                <HelpCircle className="w-4 h-4 text-white/80" />
                <span className="text-sm font-semibold text-white/90">Common Questions</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Frequently Asked Questions
              </h3>
              
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Everything you need to know about our <span className="text-white/90 font-semibold">pricing</span> and <span className="text-white/90 font-semibold">features</span>
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg">What happens when I hit my limits?</h4>
                </div>
                <p className="text-white/70 leading-relaxed ml-11">
                  You'll receive a <span className="text-white/90 font-semibold">smart notification</span> when approaching limits. Upgrade seamlessly anytime to continue without <span className="text-white/90 font-semibold">interruption</span>.
                </p>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Can I change plans anytime?</h4>
                </div>
                <p className="text-white/70 leading-relaxed ml-11">
                  <span className="text-white/90 font-semibold">Absolutely!</span> Upgrade or downgrade instantly. Changes take effect <span className="text-white/90 font-semibold">immediately</span> with prorated billing.
                </p>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Do you offer yearly discounts?</h4>
                </div>
                <p className="text-white/70 leading-relaxed ml-11">
                  <span className="text-white/90 font-semibold">Save 2 months</span> with yearly plans! Annual subscribers get <span className="text-white/90 font-semibold">priority support</span> and early feature access.
                </p>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg">What platforms do you support?</h4>
                </div>
                <p className="text-white/70 leading-relaxed ml-11">
                  <span className="text-white/90 font-semibold">Free:</span> n8n • <span className="text-white/90 font-semibold">Pro:</span> n8n, Zapier, Make.com • <span className="text-white/90 font-semibold">Enterprise:</span> Custom integrations available.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-6 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm mb-8">
              <Zap className="w-4 h-4 text-white/80 mr-2" />
              <span className="text-sm font-semibold text-white/90">
                Transform Your Business Today
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-white">
              Ready to Revolutionize with Voice AI?
            </h2>
            
            <p className="text-xl text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join thousands of businesses automating workflows through natural conversations. 
              <span className="text-white/90 font-semibold">No coding. No complexity.</span> 
              <span className="text-white/90 font-semibold">Pure innovation.</span>
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-black hover:bg-white/90 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 flex items-center space-x-3 hover:scale-105 transform w-full md:w-auto justify-center"
              >
                <Rocket className="w-6 h-6" />
                <span>{user ? 'Launch Dashboard' : 'Start Free Trial'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-8 text-white/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Logo size={32} />
              <span className="text-white font-bold text-xl">WorkFlow AI</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 mb-4">
              Democratizing automation through the power of voice and AI
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/50 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
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
