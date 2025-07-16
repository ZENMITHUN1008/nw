
import React, { useState, useEffect } from 'react';
import { Plus, Grid, List, Settings, LogOut, Zap, Database, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { ConnectionSetup } from '../components/ConnectionSetup';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowList } from '../components/WorkflowList';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { connections, workflows, loading } = useN8n();
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags] = useState<string[]>([]);

  useEffect(() => {
    if (connections.length === 0 && !loading) {
      setShowConnectionSetup(true);
    }
  }, [connections, loading]);

  const handleConnectionSuccess = () => {
    setShowConnectionSetup(false);
  };

  const handleEdit = (id: string) => {
    console.log('Edit workflow:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete workflow:', id);
  };

  const handleDuplicate = (id: string) => {
    console.log('Duplicate workflow:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('View workflow details:', id);
  };

  const handleAddTag = (workflowId: string, _tag: string) => {
    console.log('Add tag to workflow:', workflowId);
  };

  const handleRemoveTag = (workflowId: string, tagIndex: number) => {
    console.log('Remove tag from workflow:', workflowId, tagIndex);
  };

  // Transform n8n workflows to match expected interface
  const transformedWorkflows = workflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    description: `Workflow with ${workflow.nodes?.length || 0} nodes`,
    isActive: workflow.active,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    tags: workflow.tags || []
  }));

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
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                n8n Workflow Manager
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/master"
                className="flex items-center space-x-2 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-400 hover:text-amber-300 transition-all duration-200"
              >
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Master Portal</span>
              </Link>
              <Link
                to="/playground"
                className="flex items-center space-x-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all duration-200"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">AI Playground</span>
              </Link>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-50 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
          </h2>
          <p className="text-slate-400">
            Manage your n8n workflows and automation connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Connections</p>
                <p className="text-2xl font-bold text-slate-50 mt-1">{connections.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Workflows</p>
                <p className="text-2xl font-bold text-slate-50 mt-1">{workflows.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Workflows</p>
                <p className="text-2xl font-bold text-slate-50 mt-1">
                  {workflows.filter(w => w.active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Setup Modal */}
        {showConnectionSetup && (
          <ConnectionSetup
            onSuccess={handleConnectionSuccess}
            onSkip={() => setShowConnectionSetup(false)}
          />
        )}

        {/* Main Content Area */}
        {!showConnectionSetup && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Workflow</span>
                </button>
                <button
                  onClick={() => setShowConnectionSetup(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Add Connection</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workflows Section */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-50 mb-6">Workflows</h3>
              
              {viewMode === 'grid' ? (
                <WorkflowGrid
                  workflows={transformedWorkflows}
                  filterTags={filterTags}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <WorkflowList
                  workflows={transformedWorkflows}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onViewDetails={handleViewDetails}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
