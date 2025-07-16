
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ConnectionSetup } from '../components/ConnectionSetup';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { Plus, Settings, User, Zap, Activity, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    loadStats();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user?.id || '')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error checking connection:', error);
        setHasConnection(false);
      } else {
        setHasConnection(data && data.length > 0);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setHasConnection(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // For now, we'll use mock data since we don't have execution tracking yet
      setStats({
        totalWorkflows: 12,
        activeWorkflows: 8,
        totalExecutions: 156,
        successRate: 94.2
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnectionSuccess = () => {
    setHasConnection(true);
    setShowConnectionSetup(false);
  };

  const handleProfileClick = () => {
    // TODO: Implement profile page
    console.log('Profile clicked');
  };

  const navigateToPlayground = () => {
    navigate('/playground');
  };

  const navigateToMasterPortal = () => {
    navigate('/master');
  };

  // Workflow Grid handlers
  const handleEditWorkflow = (id: string) => {
    console.log('Edit workflow:', id);
  };

  const handleDeleteWorkflow = (id: string) => {
    console.log('Delete workflow:', id);
  };

  const handleDuplicateWorkflow = (id: string) => {
    console.log('Duplicate workflow:', id);
  };

  const handleViewWorkflowDetails = (id: string) => {
    console.log('View workflow details:', id);
  };

  const handleAddTag = (workflowId: string, tag: string) => {
    console.log('Add tag to workflow:', workflowId, tag);
  };

  const handleRemoveTag = (workflowId: string, tagIndex: number) => {
    console.log('Remove tag from workflow:', workflowId, tagIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">Loading Dashboard...</h3>
          <p className="text-slate-400">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo size={32} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs text-slate-400">Welcome back, {user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={navigateToPlayground}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">AI Playground</span>
              </button>

              <button
                onClick={() => setShowConnectionSetup(true)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleProfileClick}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Workflows</p>
                <p className="text-3xl font-bold text-slate-50">{stats.totalWorkflows}</p>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+2 this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Active Workflows</p>
                <p className="text-3xl font-bold text-slate-50">{stats.activeWorkflows}</p>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Running now</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Executions</p>
                <p className="text-3xl font-bold text-slate-50">{stats.totalExecutions}</p>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">+24 today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-slate-50">{stats.successRate}%</p>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Excellent</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {hasConnection === false ? (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-50 mb-4">Connect Your n8n Instance</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Get started by connecting your n8n instance to start creating and managing automated workflows.
            </p>
            <button
              onClick={() => setShowConnectionSetup(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Setup Connection</span>
            </button>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={navigateToPlayground}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
              >
                <Zap className="w-5 h-5" />
                <span>Create with AI</span>
              </button>

              <button
                onClick={() => setShowConnectionSetup(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 rounded-xl transition-all duration-200 font-medium"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Connections</span>
              </button>
            </div>

            {/* Workflows Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-50">Your Workflows</h2>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Live sync with n8n</span>
                </div>
              </div>
              <WorkflowGrid 
                workflows={[]} 
                filterTags={[]}
                onFilterChange={() => {}}
                searchTerm=""
                onSearchChange={() => {}}
                onEdit={handleEditWorkflow}
                onDelete={handleDeleteWorkflow}
                onDuplicate={handleDuplicateWorkflow}
                onViewDetails={handleViewWorkflowDetails}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </div>
          </>
        )}

        {/* Master Portal Button - Fixed at bottom */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={navigateToMasterPortal}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-white"
            title="Enter Master Portal"
          >
            <Shield className="w-5 h-5" />
            <span>Master Portal</span>
          </button>
        </div>
      </main>

      {/* Connection Setup Modal */}
      {showConnectionSetup && (
        <ConnectionSetup
          onSuccess={handleConnectionSuccess}
          onSkip={() => setShowConnectionSetup(false)}
        />
      )}
    </div>
  );
};
