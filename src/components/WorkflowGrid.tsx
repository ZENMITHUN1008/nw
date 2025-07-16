import React from 'react';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  MoreVertical, 
  ExternalLink,
  Calendar,
  Tag,
  Zap,
  CheckCircle,
  Sparkles,
  Activity,
  BarChart3
} from 'lucide-react';
import { N8nWorkflow } from '../services/n8nService';

interface WorkflowGridProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl?: string;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({ workflows, onAction }) => {
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
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNodeCount = (workflow: N8nWorkflow) => {
    return workflow.nodes?.length || 0;
  };

  const getWorkflowCardGradient = (_workflow: N8nWorkflow, index: number) => {
    const gradients = [
      'from-indigo-500/10 to-purple-500/10',
      'from-amber-500/10 to-orange-500/10',
      'from-emerald-500/10 to-teal-500/10',
      'from-pink-500/10 to-rose-500/10',
      'from-cyan-500/10 to-blue-500/10',
      'from-violet-500/10 to-purple-500/10'
    ];
    return gradients[index % gradients.length];
  };

  const getBorderGradient = (workflow: N8nWorkflow, index: number) => {
    if (workflow.active) {
      return 'border-emerald-500/30 hover:border-emerald-400/50';
    }
    const borders = [
      'border-indigo-500/20 hover:border-indigo-400/40',
      'border-amber-500/20 hover:border-amber-400/40',
      'border-purple-500/20 hover:border-purple-400/40',
      'border-pink-500/20 hover:border-pink-400/40',
      'border-cyan-500/20 hover:border-cyan-400/40'
    ];
    return borders[index % borders.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {workflows.map((workflow, index) => (
        <div
          key={workflow.id}
          className={`group relative bg-slate-800/40 backdrop-blur-xl border ${getBorderGradient(workflow, index)} rounded-2xl p-8 transition-all duration-500 hover:bg-slate-800/60 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}
        >
          {/* Premium Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getWorkflowCardGradient(workflow, index)} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          {/* Premium Header */}
          <div className="relative flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${workflow.active ? 'from-emerald-500 to-emerald-600' : 'from-slate-600 to-slate-700'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {workflow.active ? (
                    <Activity className="w-6 h-6 text-white" />
                  ) : (
                    <Pause className="w-6 h-6 text-white" />
                  )}
                </div>
                
            <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-50 truncate group-hover:text-indigo-200 transition-colors duration-300">
                {workflow.name || 'Untitled Workflow'}
              </h3>
              
                  {/* Premium Status Badge */}
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold border backdrop-blur-sm ${getStatusColor(workflow)} mt-2`}>
                {getStatusIcon(workflow)}
                    <span>{workflow.active ? 'Live & Running' : 'Ready to Deploy'}</span>
                    {workflow.active && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Actions Dropdown */}
            <div className="relative group/menu">
              <button className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 border border-slate-700/50 hover:border-slate-600 backdrop-blur-sm">
                <MoreVertical className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl z-20 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-300 transform scale-95 group-hover/menu:scale-100">
                <div className="p-2">
                  <button
                    onClick={() => workflow.id && onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group/item"
                  >
                    {workflow.active ? (
                      <>
                        <Pause className="w-5 h-5 text-amber-400 group-hover/item:scale-110 transition-transform duration-200" />
                        <span>Deactivate Workflow</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 text-emerald-400 group-hover/item:scale-110 transition-transform duration-200" />
                        <span>Activate Workflow</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => workflow.id && onAction(workflow.id, 'edit')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group/item"
                  >
                    <Edit className="w-5 h-5 text-indigo-400 group-hover/item:scale-110 transition-transform duration-200" />
                    <span>Edit in n8n Studio</span>
                  </button>
                  
                  <button
                    onClick={() => workflow.id && onAction(workflow.id, 'view')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group/item"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-400 group-hover/item:scale-110 transition-transform duration-200" />
                    <span>View Analytics</span>
                  </button>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-2"></div>
                  
                  <button
                    onClick={() => workflow.id && onAction(workflow.id, 'delete')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group/item"
                  >
                    <Trash2 className="w-5 h-5 group-hover/item:scale-110 transition-transform duration-200" />
                    <span>Delete Workflow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Workflow Metrics */}
          <div className="relative grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 group-hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Nodes</p>
                  <p className="text-lg font-bold text-slate-200">{getNodeCount(workflow)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 group-hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center border border-amber-500/20">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Updated</p>
                  <p className="text-sm font-semibold text-slate-200">{formatDate(workflow.updatedAt?.toISOString())}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tags Section */}
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="relative mb-6">
              <div className="flex flex-wrap gap-2">
                {workflow.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                    key={tagIndex}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-700/40 backdrop-blur-sm border border-slate-600/30 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-600/40 transition-all duration-200"
                >
                  <Tag className="w-3 h-3" />
                  <span>{typeof tag === 'string' ? tag : 'Tag'}</span>
                </span>
              ))}
              {workflow.tags.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                  +{workflow.tags.length - 3} more
                </span>
              )}
              </div>
            </div>
          )}

          {/* Premium Quick Actions */}
          <div className="relative flex items-center space-x-3 pt-6 border-t border-slate-700/30">
            <button
              onClick={() => workflow.id && onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
              className={`group/action flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${
                workflow.active
                  ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-500/30 text-amber-300 hover:from-amber-600/30 hover:to-amber-700/30 hover:shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30 text-emerald-300 hover:from-emerald-600/30 hover:to-emerald-700/30 hover:shadow-emerald-500/20'
              } backdrop-blur-sm hover:scale-105 hover:shadow-xl`}
            >
              {workflow.active ? (
                <>
                  <Pause className="w-5 h-5 group-hover/action:scale-110 transition-transform duration-200" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 group-hover/action:scale-110 transition-transform duration-200" />
                  <span>Deploy</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => workflow.id && onAction(workflow.id, 'edit')}
              className="group/action flex items-center justify-center p-4 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/40 hover:border-slate-500/40 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              <Edit className="w-5 h-5 group-hover/action:scale-110 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => workflow.id && onAction(workflow.id, 'view')}
              className="group/action flex items-center justify-center p-4 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/40 hover:border-slate-500/40 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              <ExternalLink className="w-5 h-5 group-hover/action:scale-110 transition-transform duration-200" />
            </button>
          </div>

          {/* Premium Performance Indicator */}
          {workflow.active && (
            <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
          )}
        </div>
      ))}
    </div>
  );
};