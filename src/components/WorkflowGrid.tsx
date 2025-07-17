
import React from 'react';
import { 
  Clock,
  Play,
  Pause,
  Settings,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  lastExecution?: string;
  createdAt: string;
}

interface WorkflowGridProps {
  workflows: Workflow[];
  onWorkflowClick?: (workflow: Workflow) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({
  workflows,
  onWorkflowClick,
  onActivate,
  onDeactivate,
  onDuplicate,
  onDelete,
  onEdit
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
        <p className="text-gray-500">Create your first workflow to get started with automation.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-lg font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                  onClick={() => onWorkflowClick?.(workflow)}
                >
                  {workflow.name}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Created {formatDate(workflow.createdAt)}</span>
                </div>
              </div>
              
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                workflow.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  workflow.active ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                {workflow.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Tags */}
            {workflow.tags && workflow.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {workflow.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {workflow.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    +{workflow.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Last Execution */}
            {workflow.lastExecution && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Activity className="w-4 h-4 mr-1" />
                <span>Last run {formatDate(workflow.lastExecution)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {workflow.active ? (
                  <button
                    onClick={() => onDeactivate?.(workflow.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Deactivate workflow"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onActivate?.(workflow.id)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Activate workflow"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => onEdit?.(workflow.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit workflow"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDuplicate?.(workflow.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Duplicate workflow"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(`/workflow/${workflow.id}`, '_blank')}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDelete?.(workflow.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
