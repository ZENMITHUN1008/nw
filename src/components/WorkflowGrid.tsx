
import React, { useState } from 'react';
import { MoreVertical, Play, Pause, Edit, Copy, Trash2, Eye, Calendar } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface WorkflowGridProps {
  workflows: Workflow[];
  filterTags: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onViewDetails: (id: string) => void;
  onAddTag: (workflowId: string, tag: string) => void;
  onRemoveTag: (workflowId: string, tagIndex: number) => void;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({
  workflows,
  filterTags,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onAddTag,
  onRemoveTag
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = filterTags.length === 0 || 
                       filterTags.some(tag => workflow.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No workflows yet</h3>
        <p className="text-slate-400 mb-6">Create your first workflow to get started with automation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-200"
          >
            {/* Workflow Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-50 truncate">{workflow.name}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{workflow.description}</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                <div className={`w-2 h-2 rounded-full ${
                  workflow.isActive ? 'bg-emerald-500' : 'bg-slate-500'
                }`} />
                
                <button
                  onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                  className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Workflow Status */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                workflow.isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {workflow.isActive ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </span>

              <div className="flex items-center text-xs text-slate-400">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(workflow.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Tags */}
            {workflow.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {workflow.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-600/50 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
                {workflow.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-600/50 text-xs text-slate-400">
                    +{workflow.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewDetails(workflow.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              
              <button
                onClick={() => onEdit(workflow.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            {/* Dropdown Menu */}
            {selectedWorkflow === workflow.id && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onDuplicate(workflow.id);
                      setSelectedWorkflow(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onDelete(workflow.id);
                      setSelectedWorkflow(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredWorkflows.length === 0 && workflows.length > 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No workflows found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
