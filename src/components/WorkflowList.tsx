import React from 'react';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Tag,
  Zap,
  CheckCircle,
  MoreVertical,
  Activity,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { N8nWorkflow } from '../services/n8nService';

interface WorkflowListProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl?: string;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ workflows, onAction }) => {
  const getStatusColor = (workflow: N8nWorkflow) => {
    if (workflow.active) {
      return 'text-emerald-400 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/30';
    }
    return 'text-slate-400 bg-gradient-to-r from-slate-500/20 to-slate-600/20 border-slate-500/30';
  };

  const getStatusIcon = (workflow: N8nWorkflow) => {
    if (workflow.active) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Pause className="w-4 h-4" />;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNodeCount = (workflow: N8nWorkflow) => {
    return workflow.nodes?.length || 0;
  };

  const getRowGradient = (workflow: N8nWorkflow, index: number) => {
    if (workflow.active) {
      return 'from-emerald-500/5 to-emerald-600/5';
    }
    const gradients = [
      'from-indigo-500/5 to-purple-500/5',
      'from-amber-500/5 to-orange-500/5',
      'from-pink-500/5 to-rose-500/5',
      'from-cyan-500/5 to-blue-500/5',
      'from-violet-500/5 to-purple-500/5'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl overflow-hidden shadow-2xl">
      {/* Premium Table Header */}
      <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm border-b border-slate-700/30">
        <div className="grid grid-cols-12 gap-6 px-8 py-6">
          <div className="col-span-4 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Workflow</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Status</span>
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Nodes</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Tags</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Updated</span>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table Body */}
      <div className="divide-y divide-slate-700/20">
        {workflows.map((workflow, index) => (
          <div
            key={workflow.id}
            className={`group relative grid grid-cols-12 gap-6 px-8 py-6 hover:bg-gradient-to-r ${getRowGradient(workflow, index)} transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer`}
          >
            {/* Premium Performance Indicator */}
            {workflow.active && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/50"></div>
            )}

            {/* Enhanced Workflow Name */}
            <div className="col-span-4 min-w-0 space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${workflow.active ? 'from-emerald-500 to-emerald-600' : 'from-slate-600 to-slate-700'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {workflow.active ? (
                    <Activity className="w-5 h-5 text-white" />
                  ) : (
                    <Pause className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-50 truncate group-hover:text-indigo-200 transition-colors duration-300">
                {workflow.name || 'Untitled Workflow'}
              </h3>
                  <p className="text-sm text-slate-400 truncate font-mono">ID: {workflow.id}</p>
                </div>
              </div>
            </div>

            {/* Premium Status */}
            <div className="col-span-2 flex items-center">
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold border backdrop-blur-sm ${getStatusColor(workflow)}`}>
                {getStatusIcon(workflow)}
                <span>{workflow.active ? 'Live & Running' : 'Ready to Deploy'}</span>
                {workflow.active && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
              </div>
            </div>

            {/* Enhanced Node Count */}
            <div className="col-span-1 flex items-center">
              <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg px-3 py-2 group-hover:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">{getNodeCount(workflow)}</span>
                </div>
              </div>
            </div>

            {/* Premium Tags */}
            <div className="col-span-2 flex items-center">
              <div className="flex flex-wrap gap-2 max-w-full">
                {workflow.tags && workflow.tags.length > 0 ? (
                  <>
                    {workflow.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-700/40 backdrop-blur-sm border border-slate-600/30 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-600/40 transition-all duration-200"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{typeof tag === 'string' ? tag : 'Tag'}</span>
                      </span>
                    ))}
                    {workflow.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        +{workflow.tags.length - 2}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-slate-500 italic">No tags</span>
                )}
              </div>
            </div>

            {/* Enhanced Last Updated */}
            <div className="col-span-2 flex items-center">
              <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg px-3 py-2 group-hover:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-medium">{formatDate(workflow.updatedAt?.toISOString())}</span>
                </div>
              </div>
            </div>

            {/* Premium Actions */}
            <div className="col-span-1 flex items-center justify-end">
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => workflow.id && onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
                  className={`group/action p-3 rounded-xl transition-all duration-300 shadow-lg ${
                    workflow.active
                      ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-500/30 text-amber-400 hover:from-amber-600/30 hover:to-amber-700/30 hover:shadow-amber-500/20'
                      : 'bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-600/30 hover:to-emerald-700/30 hover:shadow-emerald-500/20'
                  } backdrop-blur-sm hover:scale-110`}
                  title={workflow.active ? 'Deactivate' : 'Activate'}
                >
                  {workflow.active ? (
                    <Pause className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-200" />
                  ) : (
                    <Play className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-200" />
                  )}
                </button>
                
                <button
                  onClick={() => workflow.id && onAction(workflow.id, 'edit')}
                  className="group/action p-3 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/40 hover:border-slate-500/40 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-110"
                  title="Edit in n8n"
                >
                  <Edit className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-200" />
                </button>
                
                <button
                  onClick={() => workflow.id && onAction(workflow.id, 'view')}
                  className="group/action p-3 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/40 hover:border-slate-500/40 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-110"
                  title="View Analytics"
                >
                  <ExternalLink className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-200" />
                </button>

                {/* Premium More Actions Dropdown */}
                <div className="relative group/menu">
                  <button className="group/action p-3 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/40 hover:border-slate-500/40 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-110">
                    <MoreVertical className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-200" />
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl z-20 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-300 transform scale-95 group-hover/menu:scale-100">
                    <div className="p-2">
                      <button
                        onClick={() => workflow.id && onAction(workflow.id, 'delete')}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group/item"
                      >
                        <Trash2 className="w-4 h-4 group-hover/item:scale-110 transition-transform duration-200" />
                        <span>Delete Workflow</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Empty State */}
      {workflows.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
            <Zap className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-50 mb-2">No Workflows Found</h3>
          <p className="text-slate-400 max-w-md mx-auto">Your workflow list will appear here once you create or import workflows.</p>
        </div>
      )}
    </div>
  );
};