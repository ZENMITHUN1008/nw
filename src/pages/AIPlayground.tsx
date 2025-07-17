import { useState, useRef, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ModeToggle } from "../components/ModeToggle";
import { useToast } from "../hooks/use-toast";
import { Bot, User, Sparkles, Copy, Save, Loader2 } from "lucide-react";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useN8n } from "../hooks/useN8n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../components/ui/dropdown-menu"
import { aiService, ChatMessage, AIWorkflowRequest } from "../services/aiService";
import { n8nService } from "../services/n8nService";
import MarkdownRenderer from '../components/MarkdownRenderer';
import { WorkflowSummary } from '../components/WorkflowSummary';
import { WorkflowCredentialsManager } from '../components/WorkflowCredentialsManager';

export default function AIPlayground() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionId] = useState(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [showCredentialsManager, setShowCredentialsManager] = useState(false);

  const supabase = useSupabaseClient()
  const user = useUser()
  const { activeConnection, connectToN8n, disconnectFromN8n } = useN8n();
  const { toast } = useToast();

  useEffect(() => {
    // Load previous messages on component mount
    loadMessages();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, currentResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;
    try {
      const loadedMessages = await aiService.loadConversation(sessionId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error loading messages",
        description: "There was an error loading your previous messages.",
        variant: "destructive",
      });
    }
  };

  const handleStreamResponse = async (request: AIWorkflowRequest) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the AI playground.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentResponse('');
    setCurrentWorkflow(null);
    setShowCredentialsManager(false);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    try {
      for await (const chunk of aiService.generateWorkflowStream(request)) {
        if (chunk.type === 'text') {
          assistantMessage.content += chunk.content;
          setCurrentResponse(assistantMessage.content);
        } else if (chunk.type === 'workflow') {
          setCurrentWorkflow(chunk.content);
          setShowCredentialsManager(true);
        } else if (chunk.type === 'error') {
          throw new Error(chunk.content);
        }
      }

      // Add the complete message to chat history
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save conversation
      await aiService.saveConversation(sessionId, [...messages, assistantMessage]);
    } catch (error) {
      console.error('Error in streaming:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setCurrentResponse(`Sorry, I encountered an error: ${errorMessage}. Please try again.`);
      
      assistantMessage.content = `Sorry, I encountered an error: ${errorMessage}. Please try again.`;
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsComplete = (updatedWorkflow: any) => {
    setCurrentWorkflow(updatedWorkflow);
    setShowCredentialsManager(false);
    toast({
      title: "Workflow Deployed",
      description: "Your workflow has been successfully deployed to n8n!",
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Stream the response
    await handleStreamResponse({
      message: message,
      chatHistory: messages,
      action: 'generate'
    });
  };

  const saveWorkflow = () => {
    if (!currentWorkflow) {
      toast({
        title: "No workflow to save",
        description: "Please generate a workflow first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const workflowJson = JSON.stringify(currentWorkflow, null, 2);
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentWorkflow.name || 'workflow'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Workflow saved",
        description: "Workflow saved to your downloads folder.",
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error saving workflow",
        description: "There was an error saving the workflow.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-white" />
          <h1 className="text-2xl font-bold text-white">
            AI Playground
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Chat Section */}
          <div className="xl:col-span-7 order-2 xl:order-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  AI Chat
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={saveWorkflow} disabled={!currentWorkflow}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Workflow
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsWorkflowVisible(!isWorkflowVisible)}>
                    {isWorkflowVisible ? 'Hide Workflow' : 'Show Workflow'}
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <Bot className="h-8 w-8 rounded-full bg-blue-600 p-2 text-white flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-gray-500">
                        {msg.role === 'user' ? 'You' : 'AI'} - {msg.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none">
                        {msg.content}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <User className="h-8 w-8 rounded-full bg-gray-700 p-2 text-white flex-shrink-0" />
                    )}
                  </div>
                ))}

                {/* Current response */}
                {currentResponse && (
                  <div className="flex gap-3">
                    <Bot className="h-8 w-8 rounded-full bg-blue-600 p-2 text-white flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <MarkdownRenderer content={currentResponse} />
                      
                      {/* Show workflow summary if workflow was created */}
                      {currentWorkflow && (
                        <WorkflowSummary 
                          workflow={currentWorkflow} 
                          explanation={currentResponse} 
                        />
                      )}
                      
                      {/* Show credentials manager if needed */}
                      {showCredentialsManager && currentWorkflow && (
                        <WorkflowCredentialsManager
                          workflow={currentWorkflow}
                          onCredentialsComplete={handleCredentialsComplete}
                        />
                      )}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-3">
                    <Bot className="h-8 w-8 rounded-full bg-blue-600 p-2 text-white flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-gray-500">
                        AI is thinking...
                      </div>
                      <div className="animate-pulse text-white">
                        Generating workflow...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className="p-4 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <Textarea
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-transparent border-white/20 text-white focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Section */}
          <div className="xl:col-span-5 order-1 xl:order-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                n8n Workflow
              </h2>

              {activeConnection ? (
                <>
                  <div className="text-green-500 mb-2">
                    Connected to n8n instance: {activeConnection.base_url}
                  </div>
                  <Button variant="destructive" onClick={disconnectFromN8n}>
                    Disconnect from n8n
                  </Button>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Connect to your n8n instance</CardTitle>
                      <CardDescription>
                        Enter your n8n instance URL and API key to connect.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="url">URL</label>
                        <Input
                          id="url"
                          placeholder="https://your-n8n-instance.com"
                          type="url"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => n8nService.setBaseUrl(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="api-key">API Key</label>
                        <Input
                          id="api-key"
                          placeholder="Your n8n API key"
                          type="password"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => n8nService.setApiKey(e.target.value)}
                        />
                      </div>
                      <Button onClick={connectToN8n}>Connect</Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {isWorkflowVisible && currentWorkflow && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-white mb-2">
                    Workflow JSON:
                  </h3>
                  <Textarea
                    value={JSON.stringify(currentWorkflow, null, 2)}
                    readOnly
                    className="bg-transparent border-white/20 text-white h-64"
                  />
                  <Button variant="secondary" size="sm" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(currentWorkflow, null, 2));
                    toast({
                      title: "Workflow copied",
                      description: "Workflow JSON copied to clipboard.",
                    });
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
