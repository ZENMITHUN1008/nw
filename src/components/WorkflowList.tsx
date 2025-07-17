
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

interface WorkflowListProps {
  workflows: Workflow[];
  onWorkflowClick?: (workflow: Workflow) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
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
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {workflows.map((workflow) => (
          <li key={workflow.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <p 
                        className="text-sm font-medium text-indigo-600 truncate cursor-pointer hover:text-indigo-900"
                        onClick={() => onWorkflowClick?.(workflow)}
                      >
                        {workflow.name}
                      </p>
                      <div className={`ml-2 flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <p>Created {formatDate(workflow.createdAt)}</p>
                      
                      {workflow.lastExecution && (
                        <>
                          <span className="mx-2">•</span>
                          <Activity className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <p>Last run {formatDate(workflow.lastExecution)}</p>
                        </>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {workflow.active ? (
                    <button
                      onClick={() => onDeactivate?.(workflow.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Deactivate workflow"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate?.(workflow.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Activate workflow"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEdit?.(workflow.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit workflow"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => onDuplicate?.(workflow.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Duplicate workflow"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`/workflow/${workflow.id}`, '_blank')}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => onDelete?.(workflow.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete workflow"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
