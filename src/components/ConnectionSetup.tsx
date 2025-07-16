import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Edit,
  Trash2,
  Globe,
  Calendar,
  Server,
  Activity,
  Wifi,
  Clock
} from 'lucide-react';
import { useN8n } from '../hooks/useN8n';

interface ConnectionSetupProps {
  onSkip: () => void;
  onSuccess: () => void;
}

// Skeleton components
const ConnectionSkeleton = () => (
  <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 sm:p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
        <div>
          <div className="w-32 h-5 bg-slate-700 rounded mb-2"></div>
          <div className="w-48 h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="w-20 h-6 bg-slate-700 rounded-lg"></div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="w-8 h-6 bg-slate-700 rounded mx-auto mb-2"></div>
          <div className="w-16 h-3 bg-slate-700 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="w-24 h-4 bg-slate-700 rounded"></div>
        <div className="w-full h-12 bg-slate-700 rounded-xl"></div>
      </div>
    ))}
  </div>
);

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({ onSkip, onSuccess }) => {
  const { 
    activeConnection, 
    testConnection, 
    saveConnection, 
    deleteConnection, 
    loading, 
    
    loadConnections 
  } = useN8n();
  
  const [formData, setFormData] = useState({
    instanceName: '',
    baseUrl: '',
    apiKey: ''
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'testing' | 'success'>('form');
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load connections on mount with loading state
  useEffect(() => {
    const initializeConnections = async () => {
      setInitialLoading(true);
      try {
        await loadConnections();
      } catch (err) {
        console.error('Failed to load connections:', err);
      } finally {
        // Add minimum loading time for better UX
          setInitialLoading(false);
      }
    };

    initializeConnections();
  }, []);

  // Check if we should show the form or existing connection
  useEffect(() => {
    if (activeConnection) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  }, [activeConnection]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!formData.instanceName || !formData.baseUrl || !formData.apiKey) {
      return;
    }

    setStep('testing');
    try {
      const result = await testConnection(formData.baseUrl, formData.apiKey, formData.instanceName);
      setTestResult(result);
      
      if (result.success) {
        // Auto-save after successful test
        await saveConnection(
          formData.baseUrl, 
          formData.apiKey, 
          formData.instanceName,
          result.data?.workflowCount,
          result.data?.version
        );
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed'
      });
    }
  };

  const handleDeleteConnection = async () => {
    if (!activeConnection?.id) return;
    
    if (!confirm('Are you sure you want to delete this connection? You will need to reconnect your n8n instance.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteConnection(activeConnection.id);
      setShowForm(true);
    } catch (err) {
      console.error('Failed to delete connection:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditConnection = () => {
    if (activeConnection) {
      setFormData({
        instanceName: activeConnection.name,
        baseUrl: activeConnection.baseUrl,
        apiKey: '' // Don't pre-fill API key for security
      });
    }
    setShowForm(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  const isFormValid = formData.instanceName && formData.baseUrl && formData.apiKey;

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 w-full max-w-md text-center space-y-6 animate-in fade-in-50 zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-50 mb-2">Connection Successful!</h3>
            <p className="text-slate-400">
              Your n8n instance has been connected successfully. Redirecting to dashboard...
            </p>
          </div>

          {testResult?.data && (
            <div className="text-left space-y-2 text-sm bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Instance:</span>
                <span className="text-slate-50 truncate ml-2">{formData.instanceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Workflows:</span>
                <span className="text-slate-50">{testResult.data.workflowCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="text-slate-50">{testResult.data.version}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Finalizing setup...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 gap-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
              {initialLoading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Database className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-slate-50 truncate">
                {activeConnection && !showForm ? 'n8n Instance Connected' : 'Connect n8n Instance'}
              </h2>
              <p className="text-sm text-slate-400 truncate">
                {activeConnection && !showForm 
                  ? 'Your n8n instance is connected and ready' 
                  : 'Link your n8n instance to start automating'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={onSkip}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {initialLoading ? (
            /* Loading State */
            <div className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-slate-400">Loading connection status...</p>
                </div>
              </div>
              <ConnectionSkeleton />
            </div>
          ) : activeConnection && !showForm ? (
            /* Show existing connection */
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-50 truncate">{activeConnection.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{activeConnection.baseUrl}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center space-x-2 flex-shrink-0 ${getStatusColor(activeConnection.status || 'disconnected')}`}>
                    {activeConnection.status === 'connected' && <CheckCircle className="w-4 h-4" />}
                    {activeConnection.status === 'error' && <AlertCircle className="w-4 h-4" />}
                    {activeConnection.status === 'disconnected' && <Wifi className="w-4 h-4" />}
                    <span className="capitalize">{activeConnection.status || 'Unknown'}</span>
                  </div>
                </div>

                {/* Connection Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-50 mb-1">{activeConnection.workflowCount || 0}</div>
                    <div className="text-sm text-slate-400 flex items-center justify-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Workflows</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-slate-50 mb-1 truncate">{activeConnection.version || 'Unknown'}</div>
                    <div className="text-sm text-slate-400 flex items-center justify-center space-x-1">
                      <Server className="w-3 h-3" />
                      <span>Version</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-center text-slate-50 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{formatDate(activeConnection.createdAt?.toISOString()).split(',')[0]}</span>
                    </div>
                    <div className="text-sm text-slate-400">Connected</div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-center text-slate-50 mb-1">
                      <Globe className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Live</span>
                    </div>
                    <div className="text-sm text-slate-400">Status</div>
                  </div>
                </div>

                {/* Last Connected Info */}
                {activeConnection.lastConnected && (
                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>Last connected:</span>
                      </div>
                      <span className="text-slate-300 font-medium">{formatDate(activeConnection.lastConnected?.toISOString())}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Health */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-medium mb-1">Connection Active</p>
                    <p className="text-emerald-300/80 text-sm">
                      Your n8n instance is connected and ready to receive workflows. You can now create voice-powered automations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => window.open(activeConnection.baseUrl, '_blank')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Open n8n</span>
                </button>
                
                <button
                  onClick={handleEditConnection}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 rounded-xl font-semibold transition-all duration-200 border border-indigo-500/20"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Connection</span>
                </button>
                
                <button
                  onClick={handleDeleteConnection}
                  disabled={deleteLoading}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-xl font-semibold transition-all duration-200 border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span>Disconnect</span>
                </button>
              </div>

              {/* Continue to Dashboard */}
              <div className="text-center">
                <button
                  onClick={onSuccess}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center space-x-2 mx-auto"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Show connection form */
            <div className="space-y-6">
              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm min-w-0 flex-1">
                    <p className="text-blue-300 font-medium">How to get your n8n API key:</p>
                    <ol className="text-blue-200/80 space-y-1 list-decimal list-inside">
                      <li>Go to your n8n instance Settings → API</li>
                      <li>Create a new API key with workflow permissions</li>
                      <li>Copy the key and paste it below</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Form */}
              {loading && step === 'testing' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      <p className="text-slate-400">Testing connection...</p>
                    </div>
                  </div>
                  <FormSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Column */}
                  <div className="space-y-4">
                    {/* Instance Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Instance Name</label>
                      <input
                        type="text"
                        placeholder="My n8n Instance"
                        value={formData.instanceName}
                        onChange={(e) => handleInputChange('instanceName', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      />
                    </div>

                    {/* Base URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">n8n Instance URL</label>
                      <input
                        type="url"
                        placeholder="https://your-n8n-instance.com"
                        value={formData.baseUrl}
                        onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      />
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          placeholder="n8n_api_..."
                          value={formData.apiKey}
                          onChange={(e) => handleInputChange('apiKey', e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="space-y-4">
                    {/* Test Result */}
                    {testResult && (
                      <div className={`p-4 rounded-xl border ${
                        testResult.success 
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className="flex items-start gap-3">
                          {testResult.success ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-2 min-w-0 flex-1">
                            <p className={`font-medium ${
                              testResult.success ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                            </p>
                            <p className={`text-sm ${
                              testResult.success ? 'text-emerald-300' : 'text-red-300'
                            }`}>
                              {testResult.message}
                            </p>
                            
                            {testResult.success && testResult.data && (
                              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                <div>
                                  <span className="text-slate-400">Workflows:</span>
                                  <span className="ml-2 text-slate-200 font-medium">{testResult.data.workflowCount}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Version:</span>
                                  <span className="ml-2 text-slate-200 font-medium">{testResult.data.version}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Validation Helper */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                      <h4 className="font-medium text-slate-300 mb-3">Connection Checklist</h4>
                      <div className="space-y-2 text-sm">
                        <div className={`flex items-center space-x-2 ${
                          formData.instanceName ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>Instance name provided</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${
                          formData.baseUrl ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>Instance URL provided</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${
                          formData.apiKey ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>API key provided</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onSkip}
                  className="flex-1 px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-semibold transition-all duration-200"
                >
                  {activeConnection ? 'Cancel' : 'Skip for Now'}
                </button>
                
                <button
                  onClick={handleTest}
                  disabled={!isFormValid || loading || step === 'testing'}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-600/50 disabled:to-indigo-700/50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {step === 'testing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <span>{activeConnection ? 'Update Connection' : 'Test & Connect'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Help Link */}
              <div className="text-center">
                <a
                  href="https://docs.n8n.io/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                >
                  <span className="text-sm">Need help setting up API access?</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
