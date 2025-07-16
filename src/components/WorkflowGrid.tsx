import React, { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Plus, Search, X, Tag, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';

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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onViewDetails: (id: string) => void;
  filterTags: string[];
  onFilterChange: (tags: string[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddTag: (workflowId: string, tag: string) => void;
  onRemoveTag: (workflowId: string, tagIndex: number) => void;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({
  workflows,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  filterTags,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onAddTag,
  onRemoveTag,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    // Extract all unique tags from workflows
    const allTags = workflows.reduce((acc: string[], workflow) => {
      workflow.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, []);
    setAvailableTags(allTags);
  }, [workflows]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (!selectedWorkflowId) return;
    if (tagInput.trim() === '') return;

    onAddTag(selectedWorkflowId, tagInput.trim());
    setTagInput('');
    setSelectedWorkflowId(null);
  };

  const handleRemoveTag = (workflowId: string, tagIndex: number) => {
    onRemoveTag(workflowId, tagIndex);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(workflow.name) || searchRegex.test(workflow.description);
    const matchesTags = filterTags.every(tag => workflow.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleFilterTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      onFilterChange(filterTags.filter(t => t !== tag));
    } else {
      onFilterChange([...filterTags, tag]);
    }
  };

  const WorkflowCard = useCallback(({ workflow }: { workflow: Workflow }) => {
    return (
      <div key={workflow.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-4 relative">
        {/* Workflow Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-2 text-slate-400 hover:text-slate-300 rounded-full p-1 hover:bg-slate-700/30 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border border-slate-700 text-slate-400 shadow-lg">
            <DropdownMenuItem onClick={() => onEdit(workflow.id)} className="hover:bg-slate-700 focus:bg-slate-700">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(workflow.id)} className="hover:bg-slate-700 focus:bg-slate-700">
              <Copy className="w-4 h-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(workflow.id)} className="hover:bg-slate-700 focus:bg-slate-700 text-red-500">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(workflow.id)} className="hover:bg-slate-700 focus:bg-slate-700">
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <h3 className="text-lg font-bold text-slate-50 mb-2">{workflow.name}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{workflow.description}</p>

        {/* Workflow Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {workflow.tags.map((tag, index) => (
            <div key={index} className="bg-slate-700/50 text-slate-300 text-xs rounded-full px-2 py-1 flex items-center gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(workflow.id, index)} className="hover:text-slate-200">
                <XCircle className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Updated: {new Date(workflow.updatedAt).toISOString()}</span>
          <span className={`uppercase font-bold ${workflow.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
            {workflow.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    );
  }, [onDelete, onDuplicate, onEdit, onViewDetails, handleRemoveTag]);

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-slate-900 border-slate-700 text-slate-300 placeholder-slate-500 rounded-xl shadow-none focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
        />

        <div className="flex items-center gap-2">
          {availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 rounded-xl transition-all duration-200 font-medium text-sm text-slate-300">
                Filter by Tags
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border border-slate-700 text-slate-400 shadow-lg p-2">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2 py-1.5 px-3 rounded-md hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterTags.includes(tag)}
                      onChange={() => toggleFilterTag(tag)}
                      className="h-4 w-4 rounded accent-indigo-500"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 rounded-xl transition-all duration-200 font-medium text-sm text-slate-300">
              Add Tag
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border border-slate-700 text-slate-400 shadow-lg p-4">
              <div className="space-y-2">
                <Label htmlFor="tag">Tag Name:</Label>
                <Input
                  id="tag"
                  type="text"
                  placeholder="Enter tag name"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  className="bg-slate-900 border-slate-700 text-slate-300 placeholder-slate-500 rounded-xl shadow-none focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                />
                <button onClick={handleAddTag} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                  Add Tag
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Workflow Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No workflows found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map(workflow => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
};
