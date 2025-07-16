import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft,
  Send,
  Mic,

  User,
  Sparkles,
  Code,
  
  Loader2,

  MessageSquare,
  Database,
  CheckCircle,
  AlertCircle,
 
  Trash2,
      
  Clock,
  Plus,
  X,
  ChevronRight,
  History,
  
  Activity,
  WifiOff,
  RefreshCw,
  Search,
  
  Volume2,
  VolumeX,

  Square,
  
} from 'lucide-react';
import { useN8n } from '../hooks/useN8n';
import { N8nWorkflow } from '../services/n8nService';
import { WorkflowVisualization } from '../components/WorkflowVisualization';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { Logo } from '../components/Logo';
import { aiService, AIWorkflowRequest } from '../services/aiService';
import { useVoice } from '../hooks/useVoice';
import { VoiceService } from '../services/voiceService';

interface AIPlaygroundProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflow?: any;
  workflowData?: any;
  isGenerating?: boolean;
  isStreaming?: boolean;
  error?: boolean;
  aiActivities?: AIActivity[];
  searchMetadata?: {
    qualityScore?: number | null;
    explanation?: string | null;
    queries?: string[] | null;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  credentials?: { [key: string]: any };
}

interface AIActivity {
  id: string;
  type: 'web_search' | 'workflow_generation' | 'analysis';
  status: 'running' | 'completed' | 'error';
  title: string;
  description?: string;
  details?: any;
  timestamp: Date;
  duration?: number;
}



export const AIPlayground: React.FC<AIPlaygroundProps> = ({ onBack }) => {
  const { workflows, activeConnection, activateWorkflow, deactivateWorkflow, createWorkflow, loadWorkflows, isLoading: isLoadingWorkflows } = useN8n();
  
  // Voice functionality
  const voice = useVoice({
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
    voiceId: VoiceService.VOICES.RACHEL,
    maxRecordingDuration: 30000 // 30 seconds
  });
  
  // Chat History State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  
  // Current Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'welcome_cards', // Special flag for welcome cards
      timestamp: new Date(),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [showWorkflows, setShowWorkflows] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingWorkflow, setLoadingWorkflow] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // WorkFlow AI Features State
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<AIActivity | null>(null);
  const [refreshingWorkflows, setRefreshingWorkflows] = useState(false);
  
  // Voice-specific state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Local Storage Keys
  const CHAT_SESSIONS_KEY = 'workflow-ai-chat-sessions';
  const CURRENT_SESSION_KEY = 'workflow-ai-current-session';

  // Load data from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save current session whenever messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 1) {
      saveCurrentSession();
    }
  }, [messages, currentSessionId]);

  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Test AI Service Connection
  const testAIConnection = async () => {
    try {
      const isConnected = await aiService.testConnection();
      if (!isConnected) {
        setConnectionError('AI service is not available. Please check your configuration.');
      } else {
        setConnectionError(null);
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  };

  // AI Activity Management
  const addActivity = (activity: Omit<AIActivity, 'id' | 'timestamp'>) => {
    const newActivity: AIActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setCurrentActivity(newActivity);
    setAiActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep last 20 activities
  };

  const updateActivity = (id: string, updates: Partial<AIActivity>) => {
    setAiActivities(prev => prev.map(activity => 
      activity.id === id ? { ...activity, ...updates } : activity
    ));
    
    if (currentActivity?.id === id) {
      setCurrentActivity(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const completeActivity = (id: string, status: 'completed' | 'error', details?: any) => {
    const startTime = aiActivities.find(a => a.id === id)?.timestamp;
    const duration = startTime ? Date.now() - startTime.getTime() : undefined;
    
    updateActivity(id, {
      status,
      details,
      duration
    });
    
    if (currentActivity?.id === id) {
      setCurrentActivity(null);
    }
  };

  // Chat History Management Functions (keeping existing implementation)
  const loadChatHistory = () => {
    try {
      const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
      const savedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
      
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
        
        if (savedCurrentId) {
          const currentSession = sessions.find((s: ChatSession) => s.id === savedCurrentId);
          if (currentSession) {
            setCurrentSessionId(savedCurrentId);
            setMessages(currentSession.messages);
          } else {
            createNewChat();
          }
        } else {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      createNewChat();
    }
  };

  const saveCurrentSession = () => {
    if (!currentSessionId) return;
    
    const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex === -1) return;

    const updatedSession = {
      ...chatSessions[sessionIndex],
      messages: [...messages],
      updatedAt: new Date(),
      title: generateChatTitle(messages)
    };

    const updatedSessions = [...chatSessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    setChatSessions(updatedSessions);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
  };

  const generateChatTitle = (messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 47) + '...'
        : firstUserMessage.content;
    }
    return `Chat ${new Date().toLocaleDateString()}`;
  };

  const createNewChat = () => {
    if (currentSessionId && messages.some(m => m.type === 'user')) {
      saveCurrentSession();
    }

    const newSessionId = `chat-${Date.now()}`;
    const initialMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: 'welcome_cards', // Special flag for welcome cards
      timestamp: new Date(),
    };

    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [initialMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [newSession, ...chatSessions];
    setChatSessions(updatedSessions);
    setCurrentSessionId(newSessionId);
    setMessages([initialMessage]);
    
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
    localStorage.setItem(CURRENT_SESSION_KEY, newSessionId);
  };

  const loadChatSession = (sessionId: string) => {
    if (currentSessionId && messages.some(m => m.type === 'user')) {
      saveCurrentSession();
    }

    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setSelectedWorkflow(null);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      setShowChatHistory(false);
    }
  };

  const deleteChatSession = (sessionId: string) => {
    if (chatSessions.length <= 1) {
      createNewChat();
      return;
    }

    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));

    if (currentSessionId === sessionId) {
      const mostRecent = updatedSessions[0];
      if (mostRecent) {
        loadChatSession(mostRecent.id);
      } else {
        createNewChat();
      }
    }
  };

  const clearAllChats = () => {
    if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      setChatSessions([]);
      localStorage.removeItem(CHAT_SESSIONS_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);
      createNewChat();
      setShowChatHistory(false);
    }
  };

  // WorkFlow AI Response Generation with Tool Support
  const generateAIResponse = async (userMessage: string): Promise<void> => {
    const messageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setStreamingMessageId(messageId);

    // Create initial assistant message
    const assistantMessage: ChatMessage = {
      id: messageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      aiActivities: []
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      setConnectionError(null);

      // Prepare chat history for AI
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Determine action type based on context
      let action: 'generate' | 'analyze' | 'edit' | 'chat' = 'chat';
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('create') || lowerMessage.includes('generate') || lowerMessage.includes('workflow')) {
        action = 'generate';
      } else if (lowerMessage.includes('analyze') || lowerMessage.includes('explain') || (selectedWorkflow && lowerMessage.includes('this'))) {
        action = 'analyze';
      } else if (lowerMessage.includes('edit') || lowerMessage.includes('modify') || lowerMessage.includes('change')) {
        action = 'edit';
      }

      const request: AIWorkflowRequest = {
        message: userMessage,
        chatHistory,
        selectedWorkflow: selectedWorkflow || undefined,
        action,
        workflowContext: { workflows: workflows.slice(0, 5) }
      };

      let fullContent = '';
      let workflowData: any = null;
      const messageActivities: AIActivity[] = [];

      // Stream the enhanced response
      for await (const response of aiService.generateWorkflowStream(request)) {
        if (response.type === 'text') {
          fullContent += response.content;
          
          // Parse and extract search quality indicators
          const searchQualityMatch = fullContent.match(/<search_quality_score>(\d+)<\/search_quality_score>/);
          const searchExplanationMatch = fullContent.match(/<search_quality_explanation>\s*(.*?)\s*<\/search_quality_explanation>/s);
          const searchQueries = [...fullContent.matchAll(/<search>\s*(.*?)\s*<\/search>/gs)].map(match => match[1].trim());
          
          // Clean content by removing the tags
          let cleanContent = fullContent
            .replace(/<search_quality_score>\d+<\/search_quality_score>/g, '')
            .replace(/<search_quality_explanation>\s*.*?\s*<\/search_quality_explanation>/gs, '')
            .replace(/<search>\s*.*?\s*<\/search>/gs, '')
            .trim();
          
          // Create search metadata
          const searchMetadata = {
            qualityScore: searchQualityMatch ? parseInt(searchQualityMatch[1]) : null,
            explanation: searchExplanationMatch ? searchExplanationMatch[1].trim() : null,
            queries: searchQueries.length > 0 ? searchQueries : null
          };
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  content: cleanContent, 
                  isStreaming: true,
                  searchMetadata: searchMetadata.qualityScore || searchMetadata.explanation || searchMetadata.queries ? searchMetadata : undefined
                }
              : msg
          ));
        } 
        else if (response.type === 'workflow') {
          workflowData = response.content;
        }
        else if (response.type === 'tool_start') {
          const toolActivity: AIActivity = {
            id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: response.content.tool === 'web_search' ? 'web_search' : 'analysis',
            status: 'running',
            title: response.content.tool === 'web_search' ? 'Searching Web' : 'Executing Code',
            description: response.content.tool === 'web_search' ? 'Searching for latest information...' : 'Running code execution...',
            timestamp: new Date()
          };
          
          messageActivities.push(toolActivity);
          addActivity(toolActivity);
        }
        else if (response.type === 'tool_input') {
          if (currentActivity) {
            updateActivity(currentActivity.id, {
              description: 'Processing input...',
              details: { input: response.content }
            });
          }
        }
        else if (response.type === 'tool_result') {
          if (currentActivity) {
            const resultType = response.content.tool;
            const result = response.content.result;
            
            completeActivity(currentActivity.id, 'completed', {
              [resultType]: result,
              summary: resultType === 'web_search' ? 
                `Found ${result?.length || 0} search results` :
                `Code executed successfully`
            });
          }
        }
        else if (response.type === 'error') {
          if (currentActivity) {
            completeActivity(currentActivity.id, 'error', { error: response.content });
          }
          throw new Error(response.content as string);
        }
      }

      // Finalize the message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: fullContent || 'Sorry, I encountered an issue generating a response. Please try again.',
              isStreaming: false,
              workflowData: workflowData || undefined,
              error: !fullContent,
              aiActivities: messageActivities
            }
          : msg
      ));

      // Auto-speak AI response if voice is enabled (only speak AI responses, not user messages)
      if (voiceEnabled && fullContent && voice.isConfigured) {
        try {
          setCurrentlyPlaying(messageId);
          // Clean the content for voice output - remove markdown and excessive formatting
          const cleanContent = fullContent
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
            .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
            .replace(/`(.*?)`/g, '$1') // Remove code markdown
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/•/g, '') // Remove bullet points
            .replace(/\n{2,}/g, '\n') // Reduce multiple newlines
            .replace(/\n/g, '. ') // Replace newlines with periods for natural speech
            .trim();
          
          await voice.speak(cleanContent);
          setCurrentlyPlaying(null);
        } catch (error) {
          console.error('Voice synthesis error:', error);
          setCurrentlyPlaying(null);
        }
      }

    } catch (error) {
      console.error('AI generation error:', error);
      
      if (currentActivity) {
        completeActivity(currentActivity.id, 'error', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      
      // Set connection error if it seems like a connection issue
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('HTML error page') ||
        error.message.includes('service not properly')
      )) {
        setConnectionError(error.message);
      }
      
      // Update with error message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
              isStreaming: false,
              error: true
            }
          : msg
      ));
    } finally {
      setStreamingMessageId(null);
    }
  };

  // Keeping all existing handler methods...
  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    // Hide welcome cards if they are currently showing
    if (messages.length === 1 && messages[0].content === 'welcome_cards') {
      setMessages([]);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      await generateAIResponse(input.trim());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const stopSpeaking = () => {
    if (voice.isPlaying) {
      voice.stopSpeaking();
      setCurrentlyPlaying(null);
    }
  };

  const toggleListening = async () => {
    if (!voice.isConfigured) {
      setConnectionError('Voice service not configured. Please add ELEVENLABS_API_KEY to your environment.');
      return;
    }

    if (!voice.isSupported) {
      setConnectionError('Voice recording not supported in this browser.');
      return;
    }

    try {
      if (voice.isRecording) {
        // Stop recording and get transcription
        const transcription = await voice.stopRecording();
        if (transcription.trim()) {
          // Always auto-send voice messages to AI (don't just add to input)
          setInput(transcription);
          setTimeout(() => handleSendMessage(), 100);
        }
        setIsListening(false);
      } else {
        // Start recording
        await voice.startRecording();
        setIsListening(true);
        setConnectionError(null);
      }
    } catch (error) {
      setConnectionError(`Voice error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsListening(false);
    }
  };

  const handleWorkflowSelect = async (workflow: N8nWorkflow) => {
    setSelectedWorkflow(workflow);
    setLoadingWorkflow(workflow.id);
    
    // Hide welcome cards if they are currently showing
    if (messages.length === 1 && messages[0].content === 'welcome_cards') {
      setMessages([]);
    }
    
    try {
      const message: ChatMessage = {
        id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `Perfect! I've loaded **${workflow.name}** and can now provide enhanced analysis with real-time research and testing capabilities.\n\n📊 **Workflow Overview:**\n• **Status**: ${workflow.active ? '✅ Active and running' : '⏸️ Currently inactive'}\n• **Complexity**: ${workflow.nodes?.length || 0} nodes with ${Object.keys(workflow.connections || {}).length} connections\n• **Last Updated**: ${new Date(workflow.updatedAt).toLocaleDateString()}\n\n🔍 **Enhanced Analysis Available:**\n• Real-time research on node configurations\n• Code execution for testing workflow logic\n• Performance optimization recommendations\n• Security and best practice validation\n• Integration testing with your credentials\n\n**Ask me anything about this workflow - I can research the latest approaches and test configurations in real-time!**`,
        timestamp: new Date(),
        workflowData: workflow
      };
      
      setMessages(prev => [...prev, message]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `I've selected "${workflow.name}" but encountered an issue loading full details. I can still help you with general questions about this workflow based on its basic information.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoadingWorkflow(null);
    }
  };

  const handleCopyWorkflow = (workflow: any) => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    setCopiedId(workflow.id || 'generated');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeployWorkflow = async (workflow: any) => {
    if (!activeConnection) {
      alert('Please connect your n8n instance first to deploy workflows.');
      return;
    }

    try {
      setIsGenerating(true);
      
      const cleanWorkflow = {
        name: workflow.name || `AI Generated Workflow ${Date.now()}`,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        settings: workflow.settings || {},
        staticData: workflow.staticData || {}
      };

      const { active, id, createdAt, updatedAt, ...workflowForCreation } = cleanWorkflow as any;

      console.log('Deploying workflow:', workflowForCreation);

      await createWorkflow(workflowForCreation);
      
      const successMessage: ChatMessage = {
        id: `deploy-success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `🎉 **Workflow deployed successfully!**\n\nYour workflow "${workflowForCreation.name}" has been created in your n8n instance. You can now:\n\n• View it in your n8n dashboard\n• Test the workflow manually\n• Activate it when ready\n• Make further modifications\n\nThe workflow was created in an inactive state for safety. You can activate it from your n8n interface or from the Dashboard when you're ready to start automating!`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Deployment error:', error);
      const errorMessage: ChatMessage = {
        id: `deploy-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `❌ **Deployment failed**: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease check your n8n connection and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditWorkflow = (nodeId: string, newConfig: any) => {
    setMessages(prev => prev.map(msg => {
      if (msg.workflowData) {
        const updatedWorkflow = {
          ...msg.workflowData,
          nodes: msg.workflowData.nodes.map((node: any) => 
            (node.id || node.name) === nodeId ? { ...node, ...newConfig } : node
          )
        };
        
        return {
          ...msg,
          workflowData: updatedWorkflow
        };
      }
      return msg;
    }));

    const confirmMessage: ChatMessage = {
      id: `edit-confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content: `✅ **Node updated successfully!**\n\nI've updated the configuration for the node. The changes are reflected in the workflow above. You can:\n\n• Continue editing other nodes\n• Deploy the updated workflow\n• Ask me to explain the changes\n• Request further modifications`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  // Handle welcome card clicks
  const handleWelcomeCardClick = (message: string) => {
    setInput(message);
    // Remove welcome cards
    setMessages([]);
  };

  // Handle workflows refresh
  const handleRefreshWorkflows = async () => {
    if (!activeConnection || refreshingWorkflows) return;
    
    try {
      setRefreshingWorkflows(true);
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to refresh workflows:', error);
    } finally {
      setRefreshingWorkflows(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Enhanced Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
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
                <Logo size={28} />
                <div>
                  <h1 className="text-lg font-semibold text-slate-50">Playground</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Status Indicators */}
              {connectionError ? (
                <div className="flex items-center space-x-2 text-red-400">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">AI Offline</span>
                  <button
                    onClick={testAIConnection}
                    className="p-1 hover:bg-slate-700 rounded"
                    title="Retry connection"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              {activeConnection && (
                <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>{activeConnection.instance_name}</span>
                </div>
              )}
              
              {/* Enhanced Navigation */}

              

              
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showChatHistory ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
              
              <button
                onClick={() => setShowWorkflows(!showWorkflows)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showWorkflows ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Workflows</span>
              </button>

              {/* Voice Controls */}
              {voice.isConfigured && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      voiceEnabled ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:text-white'
                    }`}
                    title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                  >
                    {voiceEnabled ? (
                      voice.isPlaying ? (
                        <div className="flex items-center space-x-1">
                          <Volume2 className="w-4 h-4 animate-pulse" />
                          <div className="flex space-x-0.5">
                            <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <span className="hidden lg:inline">
                      {voice.isPlaying ? 'Speaking...' : 'Voice'}
                    </span>
                  </button>

                  {/* Stop Speaking Button (in header) */}
                  {voice.isPlaying && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center space-x-1 px-2 py-2 rounded-lg transition-colors duration-200 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                      title="Stop speaking"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-600/20 border-b border-red-600/30 p-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{connectionError}</span>
              </div>
              <button
                onClick={testAIConnection}
                className="text-red-300 hover:text-red-200 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">


        {/* Enhanced Workflows Sidebar - Google-level Design */}
        {showWorkflows && (
          <div className="w-80 bg-slate-800/30 border-r border-slate-700/50 flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-slate-700/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50">Your Workflows</h3>
                    <p className="text-xs text-slate-400">{workflows.length} workflows available</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWorkflows(false)}
                  className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors duration-200 lg:hidden"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

              
            </div>

            {/* Workflows List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {isLoadingWorkflows ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slate-800/40 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : workflows.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">No workflows found</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect to your n8n instance to see your workflows here
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {workflows.map((workflow, index) => (
                <div
                  key={workflow.id}
                  onClick={() => handleWorkflowSelect(workflow)}
                      className={`group relative bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 ${
                        selectedWorkflow?.id === workflow.id ? 'border-indigo-500/60 bg-indigo-500/5 shadow-lg shadow-indigo-500/20' : ''
                  }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                >
                  {loadingWorkflow === workflow.id && (
                        <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                          <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                            <span className="text-xs text-slate-400">Analyzing...</span>
                          </div>
                    </div>
                  )}
                  
                      {/* Workflow Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-50 truncate pr-2 group-hover:text-indigo-300 transition-colors duration-200">
                            {workflow.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            ID: {workflow.id}
                          </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 flex items-center space-x-1 ${
                          workflow.active 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            workflow.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}></div>
                          <span>{workflow.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  
                      {/* Workflow Stats */}
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>{workflow.nodes?.length || 0} nodes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                    <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                  </div>

                      {/* Action Indicators */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {selectedWorkflow?.id === workflow.id ? (
                            <div className="flex items-center space-x-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                              <CheckCircle className="w-3 h-3" />
                              <span>Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Sparkles className="w-3 h-3" />
                              <span>Click to analyze</span>
                      </div>
                          )}
                    </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </div>

                      {/* Enhanced Selection Indicator */}
                      {selectedWorkflow?.id === workflow.id && (
                        <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-xl pointer-events-none"></div>
                  )}
                </div>
              ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-700/30 bg-slate-800/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Real-time sync enabled</span>
                </div>
                <button 
                  onClick={handleRefreshWorkflows}
                  disabled={refreshingWorkflows || !activeConnection}
                  className={`flex items-center space-x-1 transition-colors duration-200 ${
                    refreshingWorkflows || !activeConnection 
                      ? 'text-slate-500 cursor-not-allowed' 
                      : 'hover:text-slate-300 cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${refreshingWorkflows ? 'animate-spin' : ''}`} />
                  <span>{refreshingWorkflows ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chat Area */}
        <div className="flex-1 flex flex-col px-4 md:px-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6 max-w-6xl mx-auto w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.content === 'welcome_cards' ? 'justify-center' : 'justify-center'
                }`}
              >
                <div className={`flex space-x-4 ${
                  message.content === 'welcome_cards' ? 'max-w-none w-full' : 'max-w-4xl w-full'
                }`}>
                  {/* Enhanced Avatar - Hidden for welcome cards */}
                  {message.content !== 'welcome_cards' && (
                    <div className="flex items-center justify-center flex-shrink-0 self-start mt-1">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : message.error ? (
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Logo size={32} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`space-y-3 ${
                    message.content === 'welcome_cards' ? 'items-center w-full' : 'items-start w-full'
                  } flex flex-col min-w-0 flex-1`}>
                    <div className={`rounded-2xl max-w-none w-full ${
                      message.content === 'welcome_cards' ? '' :
                      message.type === 'user'
                        ? 'text-indigo-50 px-4 py-3'
                        : message.error
                          ? 'bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3'
                          : 'text-slate-50 px-4 py-3'
                    }`}>
                      {message.type === 'user' ? (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      ) : message.content === 'welcome_cards' ? (
                        // Beautiful Welcome Cards
                        <div className="w-full max-w-4xl space-y-8 mx-auto">
                          {/* Welcome Title */}
                          <div className="text-center space-y-4 px-4">
                            <div className="w-16 h-16  flex items-center justify-center mx-auto ">
                              <Logo />
                            </div>
                            <div className="space-y-2">
                              <h2 className="text-2xl font-bold text-slate-50">WorkFlow AI Playground</h2>
                              <p className="text-slate-400">Choose how you'd like to get started with AI-powered workflow automation</p>
                            </div>
                          </div>

                          {/* Welcome Cards Grid */}
                          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
                            {/* Card 1: Research & Create */}
                            <div 
                              onClick={() => handleWelcomeCardClick('Research the latest n8n features and create a modern workflow that syncs Google Sheets to Slack with real-time notifications')}
                              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:from-indigo-500/10 hover:to-purple-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20"
                            >
                              <div className="space-y-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Search className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-base font-semibold text-slate-50 group-hover:text-indigo-300 transition-colors duration-200">
                                    Research & Create
                                  </h3>
                                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                                    I'll research the latest n8n features and create modern workflows for you
                                  </p>
                                </div>
                                <div className="flex items-center text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 animate-pulse"></div>
                                  Real-time web search
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200">Web Search + AI</span>
                                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
                              </div>
                            </div>

                            {/* Card 2: Test & Validate */}
                            <div 
                              onClick={() => handleWelcomeCardClick('Test and validate my workflow configurations with provided credentials, execute code to verify integrations, and provide detailed analysis')}
                              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 hover:from-emerald-500/10 hover:to-teal-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20"
                            >
                              <div className="space-y-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Code className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-base font-semibold text-slate-50 group-hover:text-emerald-300 transition-colors duration-200">
                                    Test & Validate
                                  </h3>
                                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                                    I'll test your workflows with live code execution and credential validation
                                  </p>
                                </div>
                                <div className="flex items-center text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors duration-200">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                                  Live code execution
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200">Code Exec + AI</span>
                                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
                              </div>
                            </div>

                            {/* Card 3: Analyze & Optimize */}
                            <div 
                              onClick={() => handleWelcomeCardClick('Analyze my existing workflows using web research and code execution to find optimization opportunities and suggest improvements')}
                              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-amber-500/50 hover:from-amber-500/10 hover:to-orange-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
                            >
                              <div className="space-y-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-base font-semibold text-slate-50 group-hover:text-amber-300 transition-colors duration-200">
                                    Analyze & Optimize
                                  </h3>
                                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                                    I'll analyze your workflows and find optimization opportunities
                                  </p>
                                </div>
                                <div className="flex items-center text-xs text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
                                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                                  Deep analysis
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200">Analysis + AI</span>
                                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200" />
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto px-4">
                            <button
                              onClick={() => handleWelcomeCardClick('Research the latest n8n features and create a modern workflow that syncs Google Sheets to Slack')}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2"
                            >
                              <span>🔍 Research + Generate</span>
                            </button>
                            <button
                              onClick={() => handleWelcomeCardClick('Test my workflow configurations with the provided credentials and validate all integrations')}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2"
                            >
                              <span>💻 Test & Validate</span>
                            </button>
                            <button
                              onClick={() => handleWelcomeCardClick('Analyze my workflows and research optimization opportunities using code execution')}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2"
                            >
                              <span>📊 Deep Analysis</span>
                            </button>
                            
                          </div>
                        </div>
                      ) : (
                        <div className="prose-invert">
                          <MarkdownRenderer 
                            content={message.content} 
                            className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          />
                          
                          {/* Search Quality Indicator */}
                          {message.searchMetadata && (
                            <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                              <div className="flex items-start space-x-3">
                                {message.searchMetadata.qualityScore && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                      <Search className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-xs">
                                      <div className="text-slate-300 font-medium">Search Quality</div>
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${
                                              i < (message.searchMetadata?.qualityScore ?? 0)
                                                ? 'bg-indigo-400' 
                                                : 'bg-slate-600'
                                            }`}
                                          />
                                        ))}
                                        <span className="text-indigo-400 ml-2">{message.searchMetadata.qualityScore}/5</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {message.searchMetadata.explanation && (
                                <div className="mt-3 text-xs text-slate-400 bg-slate-900/50 rounded-md p-2">
                                  <div className="text-slate-300 font-medium mb-1">Search Strategy</div>
                                  {message.searchMetadata.explanation}
                                </div>
                              )}
                              
                              {message.searchMetadata.queries && (
                                <div className="mt-3">
                                  <div className="text-xs text-slate-300 font-medium mb-2">Search Queries</div>
                                  <div className="flex flex-wrap gap-2">
                                    {message.searchMetadata.queries.map((query, index) => (
                                      <div
                                        key={index}
                                        className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-xs text-indigo-300"
                                      >
                                        🔍 {query}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1"></span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* WorkFlow AI Activities Display */}
                    {message.aiActivities && message.aiActivities.length > 0 && (
                      <div className="w-full max-w-2xl">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
                          <div className="text-xs font-medium text-slate-300 mb-2 flex items-center space-x-2">
                            <Activity className="w-3 h-3" />
                            <span>AI Operations Performed</span>
                          </div>
                          <div className="space-y-1">
                            {message.aiActivities.map((activity) => (
                              <div key={activity.id} className="flex items-center space-x-2 text-xs text-slate-400">
                                {activity.type === 'web_search' ? <Search className="w-3 h-3" /> : <Code className="w-3 h-3" />}
                                <span>{activity.title}</span>
                                <span className={`px-1 py-0.5 rounded text-xs ${
                                  activity.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  activity.status === 'error' ? 'bg-red-500/10 text-red-400' :
                                  'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {activity.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Workflow Visualization for Analyzed Workflows */}
                    {message.workflowData && (
                      <div className="w-full">
                        <WorkflowVisualization 
                          workflow={message.workflowData} 
                          onEdit={handleEditWorkflow}
                          onDeploy={handleDeployWorkflow}
                          isEditable={true}
                        />
                      </div>
                    )}

                    {message.content !== 'welcome_cards' && (
                    <div className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="mb-2">
            <div className="max-w-4xl mx-auto w-full px-4">
              {/* WorkFlow AI Status Indicator */}
              {isGenerating && (
                <div className="mb-3 flex items-center justify-center">
                  <div className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-slate-400 text-sm">WorkFlow AI is working...</span>
                    {currentActivity && (
                      <span className="text-xs text-amber-400">• {currentActivity.title}</span>
                    )}
                  </div>
                </div>
              )}

              <div className=" border border-slate-600 rounded-2xl overflow-hidden">
                <div className="flex items-end p-3 space-x-3">
                  {/* Voice Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Voice Input Button */}
                    <button
                      onClick={toggleListening}
                      disabled={!!connectionError || !voice.isSupported}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                        connectionError || !voice.isSupported
                          ? 'bg-slate-700 cursor-not-allowed opacity-50'
                          : voice.isRecording
                            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 animate-pulse'
                            : voice.isTranscribing
                              ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25'
                              : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={
                        !voice.isSupported 
                          ? 'Voice recording not supported' 
                          : !voice.isConfigured
                            ? 'Voice service not configured'
                            : voice.isRecording 
                              ? 'Click to stop recording' 
                              : 'Click to start recording'
                      }
                    >
                      {voice.isTranscribing ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : voice.isRecording ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      ) : (
                        <Mic className="w-5 h-5 text-slate-300" />
                      )}
                      
                      {/* Recording duration indicator */}
                      {voice.isRecording && voice.recordingDuration > 0 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(voice.recordingDuration / 1000)}s
                        </div>
                      )}
                    </button>

                    {/* Stop Speaking Button */}
                    {voice.isPlaying && (
                      <button
                        onClick={stopSpeaking}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700"
                        title="Stop speaking"
                      >
                        <VolumeX className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Text Input */}
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize the textarea
                        e.target.style.height = 'inherit';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder={connectionError ? "AI service is offline. Please check your configuration." : "what you want to automate today?"}
                      className="w-full bg-transparent text-slate-50 placeholder-slate-400 resize-none outline-none min-h-[2.5rem] overflow-hidden transition-all duration-200"
                      rows={1}
                      disabled={isGenerating || !!connectionError}
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isGenerating || !!connectionError}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>


            </div>
          </div>
        </div>



        {/* Chat History Sidebar (keeping existing implementation) */}
        {showChatHistory && (
          <div className="w-80 bg-slate-800/30 border-l border-slate-700/50 flex flex-col">
            {/* Chat History Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-50">Chat History</h3>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors duration-200 lg:hidden"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={createNewChat}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
                
                <button
                  onClick={clearAllChats}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200"
                  title="Clear all chats"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 cursor-pointer hover:border-indigo-500/30 transition-all duration-200 group ${
                    currentSessionId === session.id ? 'border-indigo-500/50 bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-50 text-sm truncate pr-2 flex-1">
                      {session.title}
                    </h4>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {currentSessionId === session.id && (
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.id);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{session.messages.length} messages</span>
                    <span>{formatChatTime(session.updatedAt)}</span>
                  </div>

                  {/* Enhanced session preview */}
                  <div className="mt-2 text-xs text-slate-500 truncate">
                    {session.messages.length > 1 ? 
                      session.messages[session.messages.length - 1].content.substring(0, 60) + '...' :
                      'WorkFlow AI conversation'
                    }
                  </div>



                  {currentSessionId === session.id && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <div className="flex items-center space-x-1 text-xs text-indigo-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>Active enhanced chat</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatSessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No chat history</p>
                  <p className="text-slate-500 text-xs mt-1">Start a new enhanced conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};