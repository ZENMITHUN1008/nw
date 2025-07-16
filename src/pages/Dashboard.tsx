import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  List, 
  Search, 
  Filter,
  Pause, 
  Settings, 
  Mic,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Database,
  Sparkles,
  Bot,
  Server,
  Plug,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Users,
  Globe,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { ConnectionSetup } from '../components/ConnectionSetup';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowList } from '../components/WorkflowList';
import { MCPServerManager } from '../components/MCPServerManager';
import { AIPlayground } from './AIPlayground';
import Logo from '../components/Logo';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'active' | 'inactive';
type PageView = 'dashboard' | 'playground' | 'mcp-servers';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    activeConnection, 
    workflows, 
    loading, 
    error, 
    loadWorkflows,
    activateWorkflow,
    deactivateWorkflow,
    deleteWorkflow
  } = useN8n();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');

  // Check if user needs to connect n8n instance
  useEffect(() => {
    if (!activeConnection && !loading) {
      setShowConnectionSetup(true);
    }
  }, [activeConnection, loading]);

  // Load workflows when connection is available
  useEffect(() => {
    if (activeConnection) {
      loadWorkflows();
    }
  }, [activeConnection, loadWorkflows]);

  // Filter workflows based on search and filter type
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.tags?.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && workflow.active) ||
                         (filterType === 'inactive' && !workflow.active);
    
    return matchesSearch && matchesFilter;
  });

  const handleWorkflowAction = async (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => {
    try {
      switch (action) {
        case 'activate':
          await activateWorkflow(workflowId);
          break;
        case 'deactivate':
          await deactivateWorkflow(workflowId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this workflow?')) {
            await deleteWorkflow(workflowId);
          }
          break;
        case 'edit':
          // Navigate to workflow editor
          window.open(`${activeConnection?.baseUrl}/workflow/${workflowId}`, '_blank');
          break;
        case 'view':
          // Navigate to workflow details
          window.open(`${activeConnection?.baseUrl}/execution/${workflowId}`, '_blank');
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} workflow:`, error);
    }
  };

  // Render main content based on view
  const renderMainContent = () => {
    if (showConnectionSetup) {
      return (
        <ConnectionSetup 
          onSkip={() => setShowConnectionSetup(false)}
          onSuccess={() => setShowConnectionSetup(false)}
        />
      );
    }

    if (currentView === 'playground') {
      return <AIPlayground onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'mcp-servers') {
      return <MCPServerManager onBack={() => setCurrentView('dashboard')} />;
    }

    return renderDashboardContent();
  };

  const renderDashboardContent = () => (
    <>
      {/* Premium Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Page Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-50 via-indigo-200 to-slate-50 bg-clip-text text-transparent leading-tight">
                  Your Workflows
                </h1>
                <p className="text-xl text-slate-300 mt-4 leading-relaxed max-w-2xl">
                  {activeConnection 
                    ? (
                      <>
                        Manage and monitor your <span className="text-indigo-400 font-semibold">workflows</span> from{" "}
                        <span className="text-amber-400 font-semibold">{activeConnection.name}</span>
                      </>
                    )
                    : 'Connect your n8n instance to unlock powerful workflow management'
                  }
                </p>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setCurrentView('playground')}
                className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-3"
              >
                <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span>AI Playground</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Premium Stats Dashboard */}
          {activeConnection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-12">
              {/* Total Workflows Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 hover:border-indigo-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">Total Workflows</p>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-bold text-slate-50 group-hover:text-indigo-200 transition-colors duration-300">
                      {workflows.length}
                    </p>
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">+12% this month</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                    <Database className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Active Workflows Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">Active Workflows</p>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-bold text-slate-50 group-hover:text-emerald-200 transition-colors duration-300">
                      {workflows.filter(w => w.active).length}
                    </p>
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-semibold">Running smoothly</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Inactive Workflows Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">Inactive</p>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-bold text-slate-50 group-hover:text-amber-200 transition-colors duration-300">
                      {workflows.filter(w => !w.active).length}
                    </p>
                    <div className="flex items-center space-x-2 text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">Ready to deploy</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                    <Pause className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Instance Status Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:bg-slate-800/60 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">Instance</p>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-50 group-hover:text-purple-200 transition-colors duration-300 truncate">
                      {activeConnection.name}
                    </p>
                    <div className="flex items-center space-x-2 text-purple-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm font-semibold">Ready</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Controls Bar */}
        {activeConnection && (
          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 mb-12 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Premium Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workflows, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-lg font-medium backdrop-blur-sm"
                />
              </div>

              {/* Premium Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-slate-900/30 rounded-xl p-2 border border-slate-600/30">
                  <Filter className="w-5 h-5 text-slate-400 ml-2" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="bg-transparent border-none text-slate-50 font-semibold focus:outline-none pr-4"
                  >
                    <option value="all" className="bg-slate-800 text-slate-50">All Workflows</option>
                    <option value="active" className="bg-slate-800 text-slate-50">Active Only</option>
                    <option value="inactive" className="bg-slate-800 text-slate-50">Inactive Only</option>
                  </select>
                </div>

                {/* Premium View Mode Toggle */}
                <div className="flex items-center bg-slate-900/30 rounded-xl p-2 border border-slate-600/30">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Content States */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Loading Your Workflows</h3>
                <p className="text-slate-400 text-lg">Gathering enterprise data from your n8n instance...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-8 max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-50 mb-4">Connection Error</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">{error}</p>
                <button
                  onClick={() => loadWorkflows()}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:scale-105"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        ) : !activeConnection ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-8 max-w-2xl">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl flex items-center justify-center mx-auto border border-slate-700/50 backdrop-blur-sm">
                <Database className="w-16 h-16 text-slate-400" />
              </div>
              <div>
                <h3 className="text-4xl font-bold text-slate-50 mb-6 bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
                  Connect Your n8n Instance
                </h3>
                <p className="text-xl text-slate-300 leading-relaxed mb-12">
                  Connect your <span className="text-indigo-400 font-semibold">enterprise n8n instance</span> to start managing 
                  workflows with advanced <span className="text-amber-400 font-semibold">voice commands</span> and AI automation.
                </p>
                <button
                  onClick={() => setShowConnectionSetup(true)}
                  className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-4 mx-auto"
                >
                  <Plug className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  <span>Connect n8n Instance</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-8 max-w-2xl">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/30 backdrop-blur-sm">
                <Mic className="w-16 h-16 text-amber-400" />
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-50 to-amber-200 bg-clip-text text-transparent">
                  {searchQuery || filterType !== 'all' ? 'No Matching Workflows' : 'Ready to Create Magic'}
                </h3>
                <p className="text-xl text-slate-300 leading-relaxed mb-12">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search criteria or explore different filter options.'
                    : (
                      <>
                        Start building your first <span className="text-indigo-400 font-semibold">enterprise workflow</span> using our 
                        advanced <span className="text-amber-400 font-semibold">AI-powered voice interface</span>.
                      </>
                    )
                  }
                </p>
                {!searchQuery && filterType === 'all' && (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button 
                      onClick={() => setCurrentView('playground')}
                      className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-10 py-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-4"
                    >
                      <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                      <span>Try AI Playground</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-10 py-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-4">
                      <Mic className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                      <span>Create First Workflow</span>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Premium Results Header */}
            <div className="flex items-center justify-between bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-amber-400 rounded-full animate-pulse"></div>
                <p className="text-slate-300 font-semibold text-lg">
                  Showing <span className="text-indigo-400">{filteredWorkflows.length}</span> of{" "}
                  <span className="text-amber-400">{workflows.length}</span> workflows
                </p>
              </div>
              
              <div className="flex items-center space-x-3 text-slate-400">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Enterprise View</span>
              </div>
            </div>

            {/* Premium Workflow Display */}
            <div className="relative">
              {viewMode === 'grid' ? (
                <WorkflowGrid 
                  workflows={filteredWorkflows} 
                  onAction={handleWorkflowAction}
                  baseUrl={activeConnection?.baseUrl}
                />
              ) : (
                <WorkflowList 
                  workflows={filteredWorkflows} 
                  onAction={handleWorkflowAction}
                  baseUrl={activeConnection?.baseUrl}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="relative mt-24 py-12 border-t border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Logo size={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
                WorkFlow AI Enterprise
              </span>
            </div>
            
            <p className="text-slate-400 max-w-md mx-auto">
              Empowering enterprise automation through intelligent voice interfaces and AI-driven workflow generation.
            </p>

            <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for the future of automation</span>
            </div>

            <div className="flex items-center justify-center space-x-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">Global Scale</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );

  // Dashboard-specific background wrapper component
  const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Premium Background Effects - Only for Dashboard */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-slate-900 to-amber-500/5"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      {children}
    </div>
  );

  // Clean wrapper for other views
  const CleanWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {children}
    </div>
  );

  // Render different views with appropriate wrappers
  if (currentView === 'playground') {
    return (
      <CleanWrapper>
        <AIPlayground onBack={() => setCurrentView('dashboard')} />
      </CleanWrapper>
    );
  }

  if (currentView === 'mcp-servers') {
    return (
      <CleanWrapper>
        <MCPServerManager onBack={() => setCurrentView('dashboard')} />
      </CleanWrapper>
    );
  }

  return (
    <>
    <DashboardWrapper>
      {/* Premium Dashboard Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 shadow-2xl shadow-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <Logo size={40} />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
                  WorkFlow AI
                </div>
                <div className="text-xs text-slate-400 font-medium">Dashboard</div>
              </div>
            </div>

            {/* Premium Navigation */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/30">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'dashboard' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Database className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Workflows</span>
                {currentView === 'dashboard' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </button>
              
              <button
                onClick={() => setCurrentView('playground')}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  // @ts-ignore - false positive TypeScript error
                  currentView === 'playground' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>AI Playground</span>
                {/* @ts-ignore - currentView type checking */}
                {currentView === 'playground' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </button>

              <button
                onClick={() => setCurrentView('mcp-servers')}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  // @ts-ignore - currentView type checking
                  currentView === 'mcp-servers'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Server className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>MCP Servers</span>
                {/* @ts-ignore - currentView type checking */}
                {currentView === 'mcp-servers' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </button>
            </div>

            

            {/* Premium User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConnectionSetup(true)}
                className="group p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all duration-200 border border-slate-700/50 hover:border-slate-600"
              >
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
              
              <div className="flex items-center space-x-3 bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-slate-200">{user?.email}</div>
                  <div className="text-xs text-slate-400">Premium User</div>
                </div>
                <button
                  onClick={signOut}
                  className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Premium Mobile Navigation */}
          <div className="md:hidden border-t border-slate-700/30">
            <div className="flex space-x-1 py-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 rounded-xl transition-all duration-300 ${
                  currentView === 'dashboard' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Database className="w-5 h-5" />
                <span className="text-sm font-semibold">Workflows</span>
              </button>
              
              <button
                onClick={() => setCurrentView('playground')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 rounded-xl transition-all duration-300 ${
                  // @ts-ignore - currentView type checking
                  currentView === 'playground'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">AI</span>
              </button>

              <button
                onClick={() => setCurrentView('mcp-servers')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 rounded-xl transition-all duration-300 ${
                  // @ts-ignore - currentView type checking
                  currentView === 'mcp-servers'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Server className="w-5 h-5" />
                <span className="text-sm font-semibold">MCP</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Render Content */}
      {renderMainContent()}

      {/* Master Portal Button - Fixed at bottom */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.open('/master', '_blank')}
          className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-1 flex items-center space-x-3"
        >
          <Database className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span>Enter Master Portal</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
      
    </DashboardWrapper>
    </>

  );
};
