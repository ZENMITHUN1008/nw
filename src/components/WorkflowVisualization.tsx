import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Code,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Zap,
  Settings,
  Play,
  ArrowRight,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface WorkflowVisualizationProps {
  workflow: any;
  onClose?: () => void;
  onEdit?: (nodeId: string, newConfig: any) => void;
  onDeploy?: (workflow: any) => void;
  isEditable?: boolean;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ 
  workflow, 
  onEdit,
  onDeploy,
  isEditable = true 
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleNodeEdit = (nodeId: string, node: any) => {
    setEditingNode(nodeId);
    setEditingConfig({ ...node });
  };

  const saveNodeEdit = () => {
    if (editingNode && editingConfig && onEdit) {
      onEdit(editingNode, editingConfig);
      setEditingNode(null);
      setEditingConfig(null);
    }
  };

  const cancelNodeEdit = () => {
    setEditingNode(null);
    setEditingConfig(null);
  };

  const updateNodeConfig = (path: string, value: any) => {
    if (!editingConfig) return;
    
    const pathParts = path.split('.');
    const newConfig = { ...editingConfig };
    let current = newConfig;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    setEditingConfig(newConfig);
  };

  const getNodeIcon = (nodeType: string) => {
    const type = nodeType.toLowerCase();
    if (type.includes('webhook') || type.includes('trigger')) return Zap;
    if (type.includes('http') || type.includes('api')) return Globe;
    if (type.includes('database') || type.includes('mysql') || type.includes('postgres')) return Database;
    if (type.includes('email') || type.includes('gmail')) return Mail;
    if (type.includes('slack') || type.includes('discord')) return MessageSquare;
    if (type.includes('calendar') || type.includes('google')) return Calendar;
    if (type.includes('file') || type.includes('csv')) return FileText;
    if (type.includes('code') || type.includes('function')) return Code;
    return Settings;
  };

  const getNodeColor = (nodeType: string) => {
    const type = nodeType.toLowerCase();
    if (type.includes('webhook') || type.includes('trigger')) return 'from-emerald-500 to-emerald-600';
    if (type.includes('http') || type.includes('api')) return 'from-blue-500 to-blue-600';
    if (type.includes('database')) return 'from-purple-500 to-purple-600';
    if (type.includes('email')) return 'from-red-500 to-red-600';
    if (type.includes('slack') || type.includes('discord')) return 'from-indigo-500 to-indigo-600';
    if (type.includes('calendar')) return 'from-amber-500 to-amber-600';
    if (type.includes('file')) return 'from-orange-500 to-orange-600';
    if (type.includes('code') || type.includes('function')) return 'from-gray-500 to-gray-600';
    return 'from-slate-500 to-slate-600';
  };

  const getNodeStatus = (node: any) => {
    if (node.disabled) return { color: 'text-slate-400 bg-slate-700', text: 'Disabled', icon: X };
    if (node.continueOnFail) return { color: 'text-amber-400 bg-amber-500/10', text: 'Continue on Fail', icon: AlertCircle };
    return { color: 'text-emerald-400 bg-emerald-500/10', text: 'Active', icon: CheckCircle };
  };

  const renderEditableField = (label: string, path: string, value: any, type: 'text' | 'textarea' | 'number' | 'boolean' = 'text') => {
    if (type === 'boolean') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <button
            onClick={() => updateNodeConfig(path, !value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
              value 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}
          >
            {value ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => updateNodeConfig(path, e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 font-mono text-sm"
            rows={6}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => updateNodeConfig(path, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
      </div>
    );
  };

  const renderValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-slate-500 italic">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className={`font-medium ${value ? 'text-emerald-400' : 'text-red-400'}`}>{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-400 font-medium">{value}</span>;
    }

    if (typeof value === 'string') {
      if (value.length > 100) {
        const [isExpanded, setIsExpanded] = useState(false);
        return (
          <div className="space-y-2">
            <span className="text-emerald-300">
              {isExpanded ? value : `${value.substring(0, 100)}...`}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-400 hover:text-indigo-300 text-sm underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        );
      }
      return <span className="text-emerald-300">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500">[]</span>;
      }

      return (
        <div className="space-y-1">
          <span className="text-slate-400">[{value.length} items]</span>
          {depth < 2 && (
            <div className="ml-4 space-y-1">
              {value.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-slate-500 text-sm">{index}:</span>
                  <div className="flex-1">{renderValue(item, `${key}[${index}]`, depth + 1)}</div>
                </div>
              ))}
              {value.length > 3 && (
                <span className="text-slate-500 text-sm">... and {value.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-slate-500">{'{}'}</span>;
      }

      const isExpanded = expandedNodes.has(`${key}-${depth}`);
      
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleNodeExpansion(`${key}-${depth}`)}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-300 transition-colors duration-200"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>{'{'}...{'}'} ({keys.length} properties)</span>
          </button>
          
          {isExpanded && depth < 3 && (
            <div className="ml-4 space-y-2 border-l border-slate-700 pl-4">
              {keys.slice(0, 10).map((objKey) => (
                <div key={objKey} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-medium">{objKey}:</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(value[objKey], null, 2), `${key}-${objKey}`)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                      {copiedField === `${key}-${objKey}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="ml-4">{renderValue(value[objKey], `${key}.${objKey}`, depth + 1)}</div>
                </div>
              ))}
              {keys.length > 10 && (
                <span className="text-slate-500 text-sm">... and {keys.length - 10} more properties</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-slate-300">{String(value)}</span>;
  };

  const renderNodeEditor = (node: any) => {
    if (!editingConfig) return null;

    const commonParams = editingConfig.parameters || {};
    
    return (
      <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-slate-50">Edit Node Configuration</h5>
          <div className="flex items-center space-x-2">
            <button
              onClick={saveNodeEdit}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors duration-200"
            >
              Save
            </button>
            <button
              onClick={cancelNodeEdit}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Node Name */}
        {renderEditableField('Node Name', 'name', editingConfig.name)}

        {/* Common Parameters based on node type */}
        {node.type.includes('webhook') && (
          <>
            {renderEditableField('HTTP Method', 'parameters.httpMethod', commonParams.httpMethod)}
            {renderEditableField('Path', 'parameters.path', commonParams.path)}
          </>
        )}

        {node.type.includes('httpRequest') && (
          <>
            {renderEditableField('URL', 'parameters.url', commonParams.url)}
            {renderEditableField('Method', 'parameters.requestMethod', commonParams.requestMethod)}
          </>
        )}

        {node.type.includes('function') && (
          <>
            {renderEditableField('Function Code', 'parameters.functionCode', commonParams.functionCode, 'textarea')}
          </>
        )}

        {node.type.includes('slack') && (
          <>
            {renderEditableField('Channel', 'parameters.channel', commonParams.channel)}
            {renderEditableField('Text', 'parameters.text', commonParams.text, 'textarea')}
            {renderEditableField('Username', 'parameters.username', commonParams.username)}
          </>
        )}

        {node.type.includes('gmail') && (
          <>
            {renderEditableField('To Email', 'parameters.email', commonParams.email)}
            {renderEditableField('Subject', 'parameters.subject', commonParams.subject)}
            {renderEditableField('Message', 'parameters.message', commonParams.message, 'textarea')}
          </>
        )}

        {/* Node Options */}
        <div className="pt-4 border-t border-slate-700">
          <h6 className="font-medium text-slate-300 mb-2">Node Options</h6>
          {renderEditableField('Continue on Fail', 'continueOnFail', editingConfig.continueOnFail, 'boolean')}
          {renderEditableField('Always Output Data', 'alwaysOutputData', editingConfig.alwaysOutputData, 'boolean')}
        </div>
      </div>
    );
  };

  const renderNodeCard = (node: any, index: number) => {
    const IconComponent = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);
    const status = getNodeStatus(node);
    const isExpanded = expandedNodes.has(node.id || `node-${index}`);
    const isSelected = selectedNode === (node.id || `node-${index}`);
    const isEditing = editingNode === (node.id || `node-${index}`);

    return (
      <div 
        key={node.id || index} 
        className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-all duration-200 ${
          isSelected ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-slate-700/50'
        }`}
      >
        {/* Node Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer flex-1"
              onClick={() => setSelectedNode(isSelected ? null : (node.id || `node-${index}`))}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-50">{typeof node.name === 'string' ? node.name : String(node.name || 'Unnamed Node')}</h4>
                <p className="text-sm text-slate-400 truncate">{typeof node.type === 'string' ? node.type : String(node.type || 'Unknown Type')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 ${status.color}`}>
                <status.icon className="w-3 h-3" />
                <span>{status.text}</span>
              </div>
              
              {isEditable && (
                  <button
                    onClick={() => handleNodeEdit(node.id || `node-${index}`, node)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200 text-slate-400 hover:text-slate-200"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
              )}
              
              <button
                onClick={() => toggleNodeExpansion(node.id || `node-${index}`)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Node Editor */}
        {isEditing && renderNodeEditor(node)}

        {/* Node Details */}
        {isExpanded && !isEditing && (
          <div className="p-4 space-y-4">
            {/* Position */}
            {node.position && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-400">Position X:</span>
                  <span className="ml-2 text-slate-50">{node.position[0]}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-400">Position Y:</span>
                  <span className="ml-2 text-slate-50">{node.position[1]}</span>
                </div>
              </div>
            )}

            {/* Parameters */}
            {node.parameters && Object.keys(node.parameters).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-slate-300">Parameters</h5>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(node.parameters, null, 2), `params-${node.id}`)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300 transition-colors duration-200"
                  >
                    {copiedField === `params-${node.id}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {renderValue(node.parameters, 'parameters')}
                </div>
              </div>
            )}

            {/* Credentials */}
            {node.credentials && Object.keys(node.credentials).length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-slate-300">Credentials</h5>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  {Object.entries(node.credentials).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-slate-300">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type Version */}
            {node.typeVersion && (
              <div>
                <span className="text-sm font-medium text-slate-400">Type Version:</span>
                <span className="ml-2 text-slate-50">{node.typeVersion}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-50 mb-1">{typeof workflow.name === 'string' ? workflow.name : String(workflow.name || 'Unnamed Workflow')}</h3>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>ID: {typeof workflow.id === 'string' || typeof workflow.id === 'number' ? workflow.id : String(workflow.id || 'Unknown')}</span>
              <span>•</span>
              <span>{workflow.nodes?.length || 0} nodes</span>
              <span>•</span>
              <span className={workflow.active ? 'text-emerald-400' : 'text-amber-400'}>
                {workflow.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Icon-only buttons with tooltip on hover */}
            <div className="flex items-center gap-2">
              {/* Deploy Button */}
              {isEditable && onDeploy && (
                <div className="relative group">
                  <button
                    onClick={() => onDeploy(workflow)}
                    className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    aria-label="Deploy Workflow"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Deploy
                  </div>
                </div>
              )}
              
              {/* Raw JSON Button */}
              <div className="relative group">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    showRawJson 
                      ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600/80'
                  }`}
                  aria-label="View Raw JSON"
                >
                  <Code className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {showRawJson ? 'Hide Raw JSON' : 'View Raw JSON'}
                </div>
              </div>
              
              {/* Copy Button */}
              <div className="relative group">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(workflow, null, 2), 'full-workflow')}
                  className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600/80 text-slate-300 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Copy Workflow JSON"
                >
                  {copiedField === 'full-workflow' ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {copiedField === 'full-workflow' ? 'Copied!' : 'Copy All'}
                </div>
              </div>
              
              {/* Download Button */}
              <div className="relative group">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${typeof workflow.name === 'string' ? workflow.name : 'workflow'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600/80 text-slate-300 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Download Workflow JSON"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Download
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {showRawJson ? (
          /* Raw JSON View */
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300">
                <code>{JSON.stringify(workflow, null, 2)}</code>
              </pre>
            </div>
          </div>
        ) : (
          /* Visual Node View */
          <div className="space-y-6">
            {/* Workflow Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Created</div>
                <div className="text-slate-50">
                  {workflow.createdAt 
                    ? new Date(workflow.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Updated</div>
                <div className="text-slate-50">
                  {workflow.updatedAt 
                    ? new Date(workflow.updatedAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {workflow.tags && workflow.tags.length > 0 ? (
                    workflow.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-lg">
                        {typeof tag === 'string' ? tag : String(tag)}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No tags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            {isEditable && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h4 className="font-medium text-blue-300">Interactive Workflow Editor</h4>
                </div>
                <p className="text-blue-200/80 text-sm mb-2">
                  Click on any node to view its details. Use the edit button to modify node configurations in real-time.
                </p>
                <div className="flex items-center space-x-4 text-xs text-blue-300">
                  <span>• Click nodes to select and inspect</span>
                  <span>• Edit configurations inline</span>
                  <span>• Deploy changes to n8n</span>
                </div>
              </div>
            )}

            {/* Workflow Nodes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-50">Workflow Nodes</h4>
                <span className="text-sm text-slate-400">{workflow.nodes?.length || 0} total</span>
              </div>
              
              <div className="space-y-4">
                {workflow.nodes && workflow.nodes.length > 0 ? (
                  workflow.nodes.map((node: any, index: number) => renderNodeCard(node, index))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400">No nodes found in this workflow</p>
                  </div>
                )}
              </div>
            </div>

            {/* Connections */}
            {workflow.connections && Object.keys(workflow.connections).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-50">Node Connections</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                  {Object.entries(workflow.connections).map(([nodeId, connections]: [string, any]) => (
                    <div key={nodeId} className="space-y-2">
                      <div className="font-medium text-slate-300">{nodeId}</div>
                      <div className="ml-4 space-y-1">
                        {Object.entries(connections).map(([outputIndex, outputs]: [string, any]) => (
                          <div key={outputIndex}>
                            {Array.isArray(outputs) && outputs.map((output: any, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <ArrowRight className="w-4 h-4 text-indigo-400" />
                                <span className="text-slate-400">Output {outputIndex} →</span>
                                <span className="text-slate-300">{output.node}</span>
                                <span className="text-slate-500">(input {output.input})</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};