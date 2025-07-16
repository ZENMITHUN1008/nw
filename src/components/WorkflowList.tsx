
import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Trash2, Eye, Tag, X } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface WorkflowListProps {
  workflows: Workflow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onViewDetails: (id: string) => void;
  onAddTag: (workflowId: string, tag: string) => void;
  onRemoveTag: (workflowId: string, tagIndex: number) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ 
  workflows, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onViewDetails,
  onAddTag,
  onRemoveTag
}) => {
  const [tagInput, setTagInput] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleAddTag = (workflowId: string, tag: string) => {
    if (tag.trim() !== '') {
      onAddTag(workflowId, tag);
      setTagInput('');
      setSelectedWorkflowId(null);
    }
  };

  const handleRemoveTag = (workflowId: string, tagIndex: number) => {
    onRemoveTag(workflowId, tagIndex);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700 rounded-md shadow-sm bg-slate-800 border border-slate-700">
        <thead className="bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Updated At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Tags
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {workflows.map((workflow) => (
            <tr key={workflow.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">{workflow.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {workflow.isActive ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                {new Date(workflow.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                {new Date(workflow.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                <div className="flex items-center flex-wrap gap-2">
                  {workflow.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-slate-600/70 px-2.5 py-0.5 text-xs font-medium text-slate-200"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(workflow.id, index)}
                        className="ml-1 hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedWorkflowId === workflow.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag(workflow.id, tagInput);
                          }
                        }}
                        className="bg-slate-700 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="New tag"
                      />
                      <button
                        onClick={() => handleAddTag(workflow.id, tagInput)}
                        className="ml-2 px-2 py-1 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedWorkflowId(workflow.id)}
                      className="inline-flex items-center rounded-full bg-slate-700 hover:bg-slate-600 px-2.5 py-0.5 text-xs font-medium text-slate-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      Add Tag
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                <button 
                  onClick={() => setDropdownOpen(dropdownOpen === workflow.id ? null : workflow.id)}
                  className="text-slate-400 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {dropdownOpen === workflow.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onViewDetails(workflow.id);
                          setDropdownOpen(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          onEdit(workflow.id);
                          setDropdownOpen(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(workflow.id);
                          setDropdownOpen(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this workflow?')) {
                            onDelete(workflow.id);
                          }
                          setDropdownOpen(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
