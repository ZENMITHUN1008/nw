import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, Bot, User, History, Download, Share2, RefreshCw, Loader, Database, Power, MessageSquare, Brain, Terminal, Cpu, Globe, Lock, Unlock, Key, Check, X, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService, AIWorkflowRequest, MCPServerConfig } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export const AIPlayground: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [explanation, setExplanation] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResults, setConnectionTestResults] = useState<{ success: boolean; error?: string; tools?: string[] } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMCPServers();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setHistory(prevHistory => [...prevHistory, input]);

    const aiRequest: AIWorkflowRequest = {
      prompt: input,
      userContext: {
        userId: user?.id,
        email: user?.email
      }
    };

    setInput('');
    setIsGenerating(true);
    setError(null);
    setWorkflow(null);
    setExplanation('');

    try {
      const response = await aiService.generateWorkflow(aiRequest);

      if (response.success) {
        setWorkflow(response.workflow);
        setExplanation(response.explanation);
        const botMessage: Message = {
          id: Date.now().toString(),
          text: response.explanation,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        setError(response.error || 'Failed to generate workflow.');
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Error: ${response.error || 'Failed to generate workflow.'}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Error: ${errorMessage}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startStream = async () => {
    setIsStreaming(true);
    setStreamedText('');

    const stream = await aiService.generateWorkflowStream();
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let accumulatedText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulatedText += decoder.decode(value);
        setStreamedText(accumulatedText);
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setError("Failed to process the stream.");
    } finally {
      setIsStreaming(false);
      reader.releaseLock();
    }
  };

  const saveWorkflow = async () => {
    if (!workflow) {
      setError('No workflow to save.');
      return;
    }

    try {
      const response = await aiService.saveGeneratedWorkflow(workflow);
      if (response.success) {
        alert('Workflow saved successfully!');
      } else {
        setError(response.error || 'Failed to save workflow.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workflow.';
      setError(errorMessage);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setWorkflow(null);
    setExplanation('');
    setError(null);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const loadMCPServers = async () => {
    try {
      const servers = await aiService.getMCPServers();
      setMcpServers(servers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MCP servers.');
    }
  };

  const handleAddServer = async () => {
    setIsAddingServer(true);
    try {
      const response = await aiService.addMCPServer(newServerName, newServerUrl);
      if (response.success) {
        setNewServerName('');
        setNewServerUrl('');
        await loadMCPServers();
      } else {
        setError(response.error || 'Failed to add MCP server.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add MCP server.';
      setError(errorMessage);
    } finally {
      setIsAddingServer(false);
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    try {
      const response = await aiService.removeMCPServer(serverId);
      if (response.success) {
        await loadMCPServers();
      } else {
        setError(response.error || 'Failed to remove MCP server.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove MCP server.';
      setError(errorMessage);
    }
  };

  const handleTestConnection = async (serverId: string) => {
    setSelectedServer(serverId);
    setIsTestingConnection(true);
    setConnectionTestResults(null);

    try {
      const response = await aiService.testMCPConnection(serverId);
      setConnectionTestResults(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed.';
      setError(errorMessage);
      setConnectionTestResults({ success: false, error: errorMessage });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Playground
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMaximize}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                {isMaximized ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMaximized ? 'max-h-screen overflow-hidden' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6 space-y-6">
              {/* Chat Messages */}
              <div ref={chatContainerRef} className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages.map(message => (
                  <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {message.text}
                    </div>
                    <span className="text-xs text-slate-400 mt-1">{message.timestamp}</span>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-start">
                    <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300">
                      Generating...
                    </div>
                  </div>
                )}
                {isStreaming && (
                  <div className="flex items-start">
                    <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300">
                      {streamedText}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Ask AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null}
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Workflow Explanation */}
            {explanation && (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6 mt-6">
                <h3 className="text-xl font-bold text-slate-50 mb-4">Explanation</h3>
                <p className="text-slate-400">{explanation}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-50 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={saveWorkflow}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
                  disabled={!workflow}
                >
                  <Download className="w-4 h-4" />
                  <span>Save Workflow</span>
                </button>
                <button
                  onClick={clearChat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Chat</span>
                </button>
                <button
                  onClick={startStream}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors"
                  disabled={isStreaming}
                >
                  {isStreaming ? <Loader className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  <span>Start Stream</span>
                </button>
              </div>
            </div>

            {/* History */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-50">History</h3>
                <button onClick={toggleHistory} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                  {showHistory ? <X className="w-4 h-4 text-slate-400" /> : <History className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              {showHistory && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((item, index) => (
                    <div key={index} className="text-slate-400">{item}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-50">Settings</h3>
                <button onClick={toggleSettings} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                  {isSettingsOpen ? <X className="w-4 h-4 text-slate-400" : null}
                </button>
              </div>
              {isSettingsOpen && (
                <div className="space-y-4">
                  {/* MCP Server Configuration */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-slate-300">MCP Servers</h4>
                    <div className="space-y-2">
                      {mcpServers.map(server => (
                        <div key={server.id} className="flex items-center justify-between">
                          <div className="text-slate-400">{server.name}</div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTestConnection(server.id)}
                              className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                              disabled={isTestingConnection && selectedServer === server.id}
                            >
                              {isTestingConnection && selectedServer === server.id ? (
                                <Loader className="w-4 h-4 animate-spin text-slate-400" />
                              ) : (
                                <Power className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveServer(server.id)}
                              className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {connectionTestResults && selectedServer && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                        {connectionTestResults.success ? (
                          <div className="text-emerald-400 flex items-center space-x-2">
                            <Check className="w-4 h-4" />
                            <span>Connection successful!</span>
                            {connectionTestResults.tools && connectionTestResults.tools.length > 0 && (
                              <span>Tools: {connectionTestResults.tools.join(', ')}</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-red-400 flex items-center space-x-2">
                            <X className="w-4 h-4" />
                            <span>Connection failed: {connectionTestResults.error}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add New Server Form */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-slate-300">Add New MCP Server</h4>
                    <input
                      type="text"
                      placeholder="Server Name"
                      value={newServerName}
                      onChange={(e) => setNewServerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Server URL"
                      value={newServerUrl}
                      onChange={(e) => setNewServerUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      onClick={handleAddServer}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                      disabled={isAddingServer}
                    >
                      {isAddingServer ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Add Server</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
