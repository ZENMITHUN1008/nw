
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Loader, Lightbulb, FileText, Zap, Settings } from 'lucide-react';
import { aiService, AIWorkflowRequest } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { WorkflowVisualization } from '../components/WorkflowVisualization';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  workflow?: any;
  suggestions?: string[];
}

interface AIPlaygroundProps {
  onBack: () => void;
}

export const AIPlayground: React.FC<AIPlaygroundProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { connections, activeConnection } = useN8n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI workflow assistant. I can help you create, optimize, and troubleshoot n8n workflows. What would you like to build today?",
      timestamp: new Date(),
      suggestions: [
        "Create a workflow that sends daily email reports",
        "Build an automated social media posting system",
        "Set up data synchronization between two platforms",
        "Create a webhook-based notification system"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if user is asking for workflow generation
      const isWorkflowRequest = input.toLowerCase().includes('create') || 
                               input.toLowerCase().includes('build') || 
                               input.toLowerCase().includes('workflow') ||
                               input.toLowerCase().includes('automation');

      if (isWorkflowRequest && user) {
        // Generate workflow
        const workflowRequest: AIWorkflowRequest = {
          description: input.trim(),
          userId: user.id,
          connectionId: activeConnection?.id
        };

        const response = await aiService.generateWorkflow(workflowRequest);

        if (response.success && response.workflow) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `I've created a workflow for you: **${response.workflow.name}**\n\n${response.workflow.description}\n\nThis workflow includes:\n- Webhook trigger for incoming data\n- Data processing function\n- Error handling capabilities\n\nYou can see the visual representation below and customize it further in your n8n instance.`,
            timestamp: new Date(),
            workflow: response.workflow,
            suggestions: response.suggestions
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `I apologize, but I encountered an error while generating your workflow: ${response.error || 'Unknown error'}. Please try rephrasing your request or provide more specific details about what you'd like to automate.`,
            timestamp: new Date(),
            suggestions: [
              "Try describing your use case in more detail",
              "Specify the data sources and destinations",
              "Mention any specific integrations you need"
            ]
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // General AI conversation
        let aiResponse = '';
        
        if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
          aiResponse = "Hello! I'm here to help you with n8n workflow automation. I can assist you with creating workflows, optimizing existing ones, troubleshooting issues, and providing best practices. What specific automation challenge are you working on?";
        } else if (input.toLowerCase().includes('help')) {
          aiResponse = "I can help you with various n8n workflow tasks:\n\n• **Create workflows** - Describe what you want to automate\n• **Optimize existing workflows** - Share your workflow for improvement suggestions\n• **Troubleshoot issues** - Describe problems you're experiencing\n• **Best practices** - Get recommendations for workflow design\n• **Integration guidance** - Learn about connecting different services\n\nWhat would you like assistance with?";
        } else if (input.toLowerCase().includes('connection') || input.toLowerCase().includes('connect')) {
          const connectionStatus = connections.length > 0 ? 
            `You have ${connections.length} n8n connection(s) configured.` : 
            "You don't have any n8n connections set up yet.";
          
          aiResponse = `${connectionStatus}\n\nTo create workflows, you'll need to connect to your n8n instance first. You can do this from the main dashboard by clicking "Add Connection" and providing your n8n instance URL and API key.\n\nOnce connected, I can help you create and manage workflows directly!`;
        } else {
          aiResponse = "I understand you'd like to work with n8n workflows. Could you provide more specific details about what you want to automate? For example:\n\n• What triggers should start the workflow?\n• What data needs to be processed?\n• What actions should be performed?\n• Which services or APIs need to be integrated?\n\nThe more details you provide, the better I can help you create the perfect automation!";
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          suggestions: [
            "Show me workflow templates",
            "Help me connect to n8n",
            "Create a data processing workflow",
            "Build an email automation"
          ]
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI Workflow Assistant</h1>
                  <p className="text-xs text-slate-400">Powered by advanced AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeConnection && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400">Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-slate-600' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${
                message.type === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}>
                  <MarkdownRenderer content={message.content} />
                </div>

                {/* Workflow Visualization */}
                {message.workflow && (
                  <div className="mt-4">
                    <WorkflowVisualization workflow={message.workflow} />
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-slate-400 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Try these suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-full text-sm text-slate-300 hover:text-white transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-slate-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="text-slate-300">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the workflow you'd like to create..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
