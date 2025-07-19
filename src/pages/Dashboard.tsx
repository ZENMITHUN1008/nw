import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Mic, 
  Sparkles, 
  CheckCircle, 
  Menu, 
  X,
  LogOut,
  BarChart3,
  Layers,
  Rocket,
  Settings,
  Home,
  PlusCircle,
  Server,
  Headphones
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useVoice } from '../hooks/useVoice';
import { useSubscription } from '../hooks/useSubscription';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowVisualization } from '../components/WorkflowVisualization';
import { MCPServerManager } from '../components/MCPServerManager';
import { ProfilePage } from '../components/ProfilePage';
import UsageLimitModal from '../components/UsageLimitModal';
import PricingModal from '../components/PricingModal';
import Logo from '../components/Logo';

// Utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
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

function getBgImage(variant: BGVariantType, fill: string) {
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
  const backgroundImage = getBgImage(variant, fill);
  
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
  onClick?: () => void;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, onClick, delay = 0 }: FeatureCardProps) => {
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
      className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
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

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isRecording, startRecording, stopRecording } = useVoice();
  const { usage, currentTier } = useSubscription();
  const [currentView, setCurrentView] = useState<'overview' | 'workflows' | 'visualization' | 'mcp' | 'profile'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usageLimitModalOpen, setUsageLimitModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

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

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'workflows', label: 'Workflows', icon: Layers },
    { id: 'visualization', label: 'Visualization', icon: BarChart3 },
    { id: 'mcp', label: 'MCP Server', icon: Server },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const handleVoiceToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'workflows':
        return <WorkflowGrid workflows={[]} onAction={() => {}} />;
      case 'visualization':
        return <WorkflowVisualization workflow={null} />;
      case 'mcp':
        return <MCPServerManager onBack={() => setCurrentView('overview')} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentView('overview')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden"
            >
              <BGPattern variant="dots" mask="fade-edges" size={20} fill="#ffffff10" />
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
                    <p className="text-white/70">{user?.email}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Workflows</p>
                        <p className="text-white font-semibold">12 Active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Headphones className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Voice Minutes</p>
                        <p className="text-white font-semibold">{usage?.voiceMinutes || 0} Used</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Plan</p>
                        <p className="text-white font-semibold">{currentTier?.name || 'Free'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Control */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleVoiceToggle}
                    className={cn(
                      "relative w-20 h-20 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                      isRecording 
                        ? "bg-red-500/20 border-red-500 animate-pulse" 
                        : "bg-white/10 border-white/30 hover:bg-white/20"
                    )}
                  >
                    <Mic className={cn("w-8 h-8", isRecording ? "text-red-400" : "text-white")} />
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                    )}
                  </button>
                </div>
                <p className="text-center text-white/60 mt-4">
                  {isRecording ? "Listening... Speak your command" : "Click to start voice command"}
                </p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<PlusCircle className="w-6 h-6 text-white" />}
                title="Create Workflow"
                description="Build a new automation workflow using voice commands"
                onClick={() => setCurrentView('workflows')}
                delay={0.1}
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="View Analytics"
                description="Visualize your workflow performance and metrics"
                onClick={() => setCurrentView('visualization')}
                delay={0.2}
              />
              <FeatureCard
                icon={<Server className="w-6 h-6 text-white" />}
                title="MCP Server"
                description="Manage your Model Context Protocol server connections"
                onClick={() => setCurrentView('mcp')}
                delay={0.3}
              />
              <FeatureCard
                icon={<Rocket className="w-6 h-6 text-white" />}
                title="Upgrade Plan"
                description="Unlock more features with our Pro or Enterprise plans"
                onClick={() => setPricingModalOpen(true)}
                delay={0.4}
              />
            </div>
          </div>
        );
    }
  };

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
        <div className="flex items-center space-x-3">
          <Logo size={32} />
          <span className="text-xl font-bold text-white">WorkFlow AI</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm",
                currentView === item.id
                  ? "bg-white/20 text-white border border-white/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 border border-white/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium truncate max-w-32">{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/60 hover:text-white transition-all duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:hidden">
            <div className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                    currentView === item.id
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-32 px-6 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {renderCurrentView()}
        </div>
      </main>

      {/* Modals */}
      <UsageLimitModal 
        isOpen={usageLimitModalOpen}
        onClose={() => setUsageLimitModalOpen(false)}
        onUpgrade={() => {
          setUsageLimitModalOpen(false);
          setPricingModalOpen(true);
        }}
        limitType="workflow"
        currentTier={currentTier}
        usage={usage}
      />

      <PricingModal 
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
};
