import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Server,
  Trash2,
  Edit,
  Globe,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Wrench,
  RefreshCw,
  CheckCircle,
  FileText,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";

interface MCPServer {
  id?: string;
  name: string;
  url: string;
  authorization_token?: string;
  tool_configuration?: {
    enabled: boolean;
    allowed_tools?: string[];
  };
  status?: 'connected' | 'disconnected' | 'testing';
  tools?: MCPTool[];
  created_at?: string;
}

interface MCPTool {
  name: string;
  description?: string;
  parameters?: any;
}

interface MCPServerManagerProps {
  onBack: () => void;
}

// MCP Server JSON Schema Template
const MCP_SERVER_TEMPLATE = {
  type: "url",
  name: "Example MCP Server",
  url: "https://your-mcp-server.com/sse",
  authorization_token: "",
  tool_configuration: {
    enabled: true,
    allowed_tools: []
  }
};

// Preset Examples
const MCP_PRESETS: Record<string, any> = {
  basic: {
    type: "url",
    name: "Basic MCP Server",
    url: "https://your-mcp-server.com/sse",
    authorization_token: ""
  },
  supabase: {
    type: "url",
    name: "Supabase MCP Server",
    url: "https://mcp-supabase.example.com/sse",
    authorization_token: "sbp_your_access_token_here",
    tool_configuration: {
      enabled: true,
      allowed_tools: ["query_database", "execute_function", "manage_auth"]
    }
  },
  github: {
    type: "url", 
    name: "GitHub MCP Server",
    url: "https://mcp-github.example.com/sse",
    authorization_token: "ghp_your_github_token_here",
    tool_configuration: {
      enabled: true,
      allowed_tools: ["create_repo", "manage_issues", "pull_requests"]
    }
  }
};

export const MCPServerManager: React.FC<MCPServerManagerProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [testingServer, setTestingServer] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});
  
  // JSON Form state
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
  if (user?.id) {
    loadMCPServers();
  } else {
    setLoading(true); // Keep loading until user is available
  }
}, [user?.id]); // Add user.id as dependency

  useEffect(() => {
    // Initialize JSON input when form opens
    if (showAddForm) {
      if (editingServer) {
        const serverJson = {
          type: "url",
          name: editingServer.name,
          url: editingServer.url,
          authorization_token: editingServer.authorization_token || "",
          ...(editingServer.tool_configuration && { tool_configuration: editingServer.tool_configuration })
        };
        setJsonInput(JSON.stringify(serverJson, null, 2));
      } else {
        setJsonInput(JSON.stringify(MCP_SERVER_TEMPLATE, null, 2));
      }
      setJsonError('');
    }
  }, [showAddForm, editingServer]);

  const debugMCPServers = async () => {
    try {
      console.log('=== MCP DEBUG START ===');
      
      if (!supabase) {
        console.log('Supabase not configured');
        return;
      }
      
      // Check current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      console.log('Current user from auth:', currentUser?.id, userError);
      console.log('User from hook:', user?.id);
      console.log('User match:', currentUser?.id === user?.id);
      
      // Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id, sessionError);
      
      // Try query with specific user_id
      const { data: userData, error: userDataError } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('user_id', user?.id);
      console.log('User-specific MCP servers:', userData, userDataError);
      
      // Check if RLS is causing issues by checking count
      const { count, error: countError } = await supabase
        .from('mcp_servers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      console.log('Count of user MCP servers:', count, countError);
      
      console.log('=== MCP DEBUG END ===');
      
      // Show results in alert too
      alert(`Debug results:
      - User ID: ${user?.id}
      - Auth User ID: ${currentUser?.id}
      - Match: ${currentUser?.id === user?.id}
      - Servers found: ${userData?.length || 0}
      - Count: ${count}
      - Error: ${userDataError?.message || 'None'}
      
      Check console for full details.`);
    } catch (error) {
      console.error('Debug error:', error);
      alert(`Debug failed: ${error}`);
    }
  };

  const loadMCPServers = async () => {
    try {
      console.log('Loading MCP servers for user:', user?.id);
      
      if (!user?.id) {
        console.error('No user ID available');
        setServers([]);
        return;
      }

      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('user_id', user.id);

      console.log('MCP servers query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loaded MCP servers:', data);
      setServers(data || []);
    } catch (error) {
      console.error('Error loading MCP servers:', error);
      alert('Failed to load MCP servers. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const validateMCPServerJSON = (jsonString: string): { valid: boolean; data?: any; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      
      // Required fields validation
      const requiredFields = ['type', 'name', 'url'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }

      // Type validation
      if (data.type !== 'url') {
        return { valid: false, error: 'Type must be "url"' };
      }

            // URL validation
      if (!data.url.startsWith('https://')) {
        return { valid: false, error: 'URL must start with https://' };
      }

      // Tool configuration validation (optional)
      if (data.tool_configuration) {
        if (typeof data.tool_configuration !== 'object') {
          return { valid: false, error: 'tool_configuration must be an object' };
        }
        if (data.tool_configuration.enabled !== undefined && typeof data.tool_configuration.enabled !== 'boolean') {
          return { valid: false, error: 'tool_configuration.enabled must be a boolean' };
        }
        if (data.tool_configuration.allowed_tools !== undefined && !Array.isArray(data.tool_configuration.allowed_tools)) {
          return { valid: false, error: 'tool_configuration.allowed_tools must be an array' };
        }
      }

      return { valid: true, data };
    } catch (error: any) {
      return { valid: false, error: `Invalid JSON: ${error.message}` };
    }
  };

 const handleSaveServer = async () => {
  try {
    const validation = validateMCPServerJSON(jsonInput);
    
    if (!validation.valid) {
      setJsonError(validation.error || 'Invalid JSON');
      return;
    }

    const serverData = {
      name: validation.data.name,
      url: validation.data.url,
      authorization_token: validation.data.authorization_token || null,
      tool_configuration: validation.data.tool_configuration || { enabled: true, allowed_tools: [] },
      user_id: user?.id,
      status: 'disconnected'
    };

    if (editingServer?.id) {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('mcp_servers')
        .update(serverData)
        .eq('id', editingServer.id);

      if (error) throw error;
    } else {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('mcp_servers')
        .insert([serverData]);

      if (error) throw error;
    }

    await loadMCPServers();
    resetForm();
  } catch (error) {
    console.error('Error saving MCP server:', error);
    setJsonError('Failed to save MCP server. Please try again.');
  }
};

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to delete this MCP server?')) return;

    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', serverId);

      if (error) throw error;
      await loadMCPServers();
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      alert('Failed to delete MCP server. Please try again.');
    }
  };

  const testServerConnection = async (server: MCPServer) => {
    setTestingServer(server.id!);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-mcp-server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase ? (await supabase.auth.getSession()).data.session?.access_token : ''}`
        },
        body: JSON.stringify({
          url: server.url,
          authorization_token: server.authorization_token ? 
            (server.authorization_token.startsWith('Bearer ') ? 
              server.authorization_token : 
              `Bearer ${server.authorization_token}`) : 
            undefined
        })
      });

      const result = await response.json();
      
      if (result.success && supabase) {
        await supabase
          .from('mcp_servers')
          .update({ 
            status: 'connected',
            tools: result.tools 
          })
          .eq('id', server.id);
        
        await loadMCPServers();
      } else {
        if (result.status === 401) {
          alert('Authentication failed: Please check your authorization token and try again.');
        } else {
          alert(`Failed to connect to MCP server: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error testing MCP server:', error);
      alert('Failed to test MCP server connection. Please check the URL and network connection.');
    } finally {
      setTestingServer(null);
    }
  };

  const resetForm = () => {
    setJsonInput('');
    setJsonError('');
    setSelectedPreset('');
    setShowAddForm(false);
    setEditingServer(null);
  };

  const startEdit = (server: MCPServer) => {
    setEditingServer(server);
    setShowAddForm(true);
  };

  const toggleTokenVisibility = (serverId: string) => {
    setShowToken(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const selectedPreset = MCP_PRESETS[presetKey] || MCP_SERVER_TEMPLATE;
    setJsonInput(JSON.stringify(selectedPreset, null, 2));
    setJsonError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJsonInput = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-slate-400">Loading MCP servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">MCP Server Manager</h1>
                  <p className="text-sm text-slate-400">Model Context Protocol Integration</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={debugMCPServers}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                title="Debug MCP loading (check console)"
              >
                🐛 Debug
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>Add MCP Server</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Servers</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">{servers.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Connected</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">
                    {servers.filter(s => s.status === 'connected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Available Tools</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">
                    {servers.reduce((sum, s) => sum + (s.tools?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JSON Editor Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-semibold">
                    {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Preset Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Quick Start Templates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(MCP_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handlePresetSelect(key)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedPreset === key 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {preset.name.replace(' MCP Server', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* JSON Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-300">
                    MCP Server Configuration (JSON)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={formatJsonInput}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors duration-200"
                    >
                      Format JSON
                    </button>
                    <button
                      onClick={() => copyToClipboard(jsonInput)}
                      className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors duration-200"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setJsonError('');
                    }}
                    placeholder="Enter MCP server configuration as JSON..."
                    className="w-full h-64 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 font-mono text-sm resize-none"
                  />
                  {jsonError && (
                    <div className="absolute -bottom-8 left-0 flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Schema Documentation */}
              <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-600">
                <h3 className="text-sm font-medium text-slate-300 mb-3">JSON Schema Reference</h3>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div><span className="text-indigo-400">type</span>: <span className="text-amber-400">"url"</span> <span className="text-red-400">(required)</span> - Currently only "url" is supported</div>
                  <div><span className="text-indigo-400">name</span>: <span className="text-amber-400">string</span> <span className="text-red-400">(required)</span> - Unique identifier for this MCP server</div>
                  <div><span className="text-indigo-400">url</span>: <span className="text-amber-400">string</span> <span className="text-red-400">(required)</span> - Must start with https://</div>
                  <div><span className="text-indigo-400">authorization_token</span>: <span className="text-amber-400">string</span> <span className="text-slate-500">(optional)</span> - OAuth authorization token</div>
                  <div><span className="text-indigo-400">tool_configuration</span>: <span className="text-amber-400">object</span> <span className="text-slate-500">(optional)</span> - Configure tool usage</div>
                  <div className="ml-4"><span className="text-indigo-400">enabled</span>: <span className="text-amber-400">boolean</span> - Whether to enable tools (default: true)</div>
                  <div className="ml-4"><span className="text-indigo-400">allowed_tools</span>: <span className="text-amber-400">string[]</span> - Restrict allowed tools (default: all tools)</div>
                  <div className="text-emerald-400 text-xs mt-2">💡 MCP automatically discovers tools - use tool_configuration to restrict access</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveServer}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200"
                >
                  {editingServer ? 'Update Server' : 'Add Server'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Servers List */}
        <div className="space-y-6">
          {servers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Server className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">No MCP Servers</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Add your first MCP server to extend Claude's capabilities with external tools and data sources.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Add Your First MCP Server
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {servers.map((server) => (
                <div key={server.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          server.status === 'connected' ? 'bg-emerald-500' :
                          server.status === 'testing' ? 'bg-amber-500 animate-pulse' :
                          'bg-slate-500'
                        }`}></div>
                        <h3 className="text-lg font-semibold text-slate-50">{server.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          server.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' :
                          server.status === 'testing' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {server.status === 'connected' ? 'Connected' :
                           server.status === 'testing' ? 'Testing...' :
                           'Disconnected'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Globe className="w-4 h-4" />
                          <span>{server.url}</span>
                        </div>
                        {server.authorization_token && (
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Shield className="w-4 h-4" />
                            <span>
                              {showToken[server.id!] ? 
                                server.authorization_token : 
                                '•'.repeat(Math.min(server.authorization_token.length, 20))
                              }
                            </span>
                            <button
                              onClick={() => toggleTokenVisibility(server.id!)}
                              className="text-slate-500 hover:text-slate-400 transition-colors"
                            >
                              {showToken[server.id!] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {server.tools && server.tools.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Available Tools ({server.tools.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {server.tools.slice(0, 6).map((tool) => (
                              <span
                                key={tool.name}
                                className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm rounded-lg border border-indigo-500/20"
                              >
                                {tool.name}
                              </span>
                            ))}
                            {server.tools.length > 6 && (
                              <span className="px-3 py-1 bg-slate-700 text-slate-400 text-sm rounded-lg">
                                +{server.tools.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => testServerConnection(server)}
                        disabled={testingServer === server.id}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Test Connection"
                      >
                        {testingServer === server.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(server)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200"
                        title="Edit Server"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id!)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200"
                        title="Delete Server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
