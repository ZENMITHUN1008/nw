import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Send, Download, Copy, Upload, Settings, Bot, User, Zap, Code, Workflow, ChevronDown, ChevronUp, Trash2, Plus, Play, Pause, RotateCcw, Save, FileText, Terminal, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useN8n } from "@/hooks/useN8n";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'workflow' | 'error';
  workflow?: any;
}

export interface WorkflowContext {
  [key: string]: any;
}

export const AIPlayground: React.FC = () => {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('Generated Workflow');
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chat');
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext>({});
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const { saveWorkflow, loadWorkflow } = useN8n();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('n8n_credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching credentials:', error);
        toast({
          title: "Error",
          description: "Failed to load credentials.",
          variant: "destructive",
        });
        return;
      }

      const creds:any = {};
      data.forEach((cred:any) => {
        creds[cred.name] = cred.id;
      });
      setCredentials(creds);
    };

    fetchCredentials();
  }, [user, toast]);

  const handleCredentialChange = (credentialName: string) => {
    setSelectedCredential(credentialName);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  const toggleWorkflowVisibility = () => {
    setIsWorkflowVisible(!isWorkflowVisible);
  };

  const toggleSettingsVisibility = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  const toggleContextVisibility = () => {
    setIsContextVisible(!isContextVisible);
  };

  const handleUserMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
  };

  const handleWorkflowNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handleContextChange = (key: string, value: any) => {
    setWorkflowContext(prev => ({ ...prev, [key]: value }));
  };

  const handleSendMessage = () => {
    if (userMessage.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    generateAIResponse(userMessage);
    setUserMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyzeWorkflow = () => {
    if (!generatedWorkflow) {
      toast({
        title: "Error",
        description: "No workflow to analyze.",
        variant: "destructive",
      });
      return;
    }

    generateAIResponse('Analyze this workflow for best practices, error handling, and optimization opportunities.', 'analyze', generatedWorkflow, workflowContext);
  };

  const handleEditWorkflow = () => {
    if (!generatedWorkflow) {
      toast({
        title: "Error",
        description: "No workflow to edit.",
        variant: "destructive",
      });
      return;
    }

    generateAIResponse('Modify this workflow to improve its efficiency and add error handling.', 'edit', generatedWorkflow, workflowContext);
  };

  const handleSaveWorkflow = async () => {
    if (!generatedWorkflow) {
      toast({
        title: "Error",
        description: "No workflow to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveWorkflow(workflowName, generatedWorkflow);
      toast({
        title: "Success",
        description: "Workflow saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow.",
        variant: "destructive",
      });
    }
  };

  const handleLoadWorkflow = async () => {
    try {
      const loadedWorkflow = await loadWorkflow();
      if (loadedWorkflow) {
        setGeneratedWorkflow(loadedWorkflow);
        setWorkflowName(loadedWorkflow.name || 'Loaded Workflow');
        toast({
          title: "Success",
          description: "Workflow loaded successfully.",
        });
      } else {
        toast({
          title: "Info",
          description: "No workflow found to load.",
        });
      }
    } catch (error: any) {
      console.error('Error loading workflow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workflow.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadWorkflow = () => {
    if (!generatedWorkflow) {
      toast({
        title: "Error",
        description: "No workflow to download.",
        variant: "destructive",
      });
      return;
    }

    const dataStr = JSON.stringify(generatedWorkflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Success",
      description: "Workflow downloaded successfully.",
    });
  };

  const handleCopyWorkflow = () => {
    if (!generatedWorkflow) {
      toast({
        title: "Error",
        description: "No workflow to copy.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2))
      .then(() => {
        toast({
          title: "Success",
          description: "Workflow copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy workflow: ', err);
        toast({
          title: "Error",
          description: "Failed to copy workflow to clipboard.",
          variant: "destructive",
        });
      });
  };

  const generateAIResponse = async (userMessage: string, action = 'generate', workflow = null, context = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting AI generation with action:', action);

      // Use the Supabase edge function instead of direct OpenAI API
      const { data, error } = await supabase.functions.invoke('workflow-generator', {
        body: {
          message: userMessage,
          chatHistory: messages,
          selectedWorkflow: workflow,
          action: action,
          workflowContext: context,
          credentials: credentials || {}
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate AI response');
      }

      // If we get a direct response (non-streaming), handle it
      if (data && !data.streaming) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content || 'Response generated successfully.',
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, assistantMessage]);
        return;
      }

      // For streaming responses, we need to handle the stream
      const response = await fetch(`https://kqemyueobhimorhdxodh.supabase.co/functions/v1/workflow-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages,
          selectedWorkflow: workflow,
          action: action,
          workflowContext: context,
          credentials: credentials || {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);

      let buffer = '';
      let currentWorkflow = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                console.log('Received chunk:', parsed);

                if (parsed.type === 'text' && parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  ));
                } else if (parsed.type === 'workflow' && parsed.content) {
                  console.log('Received workflow:', parsed.content);
                  currentWorkflow = parsed.content;
                  setGeneratedWorkflow(currentWorkflow);
                  
                  // Add workflow to message
                  assistantMessage.workflow = currentWorkflow;
                  assistantMessage.type = 'workflow';
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, workflow: currentWorkflow, type: 'workflow' }
                      : msg
                  ));
                } else if (parsed.type === 'tool_start') {
                  console.log('Tool started:', parsed.content);
                  assistantMessage.content += `\n\n🔧 **${parsed.content?.tool || 'Tool'}** started...\n`;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  ));
                } else if (parsed.type === 'error') {
                  console.error('Stream error:', parsed.content);
                  throw new Error(parsed.content);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
                // Continue processing other chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('AI generation error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Workflow className="w-6 h-6 text-muted-foreground" />
          <CardTitle className="text-lg font-bold">AI Workflow Playground</CardTitle>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={toggleChatVisibility}>
            {isChatVisible ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            Chat
          </Button>
          <Button variant="outline" size="sm" onClick={toggleWorkflowVisibility}>
            {isWorkflowVisible ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            Workflow
          </Button>
          <Button variant="outline" size="sm" onClick={toggleSettingsVisibility}>
            {isSettingsVisible ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-grow">
        {/* Chat Section */}
        {isChatVisible && (
          <div className="w-1/4 p-4 border-r flex flex-col">
            <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <ScrollArea ref={chatContainerRef} className="flex-grow">
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg p-3 w-fit max-w-[75%] ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>
                          {msg.type === 'text' && (
                            <MarkdownRenderer content={msg.content} />
                          )}
                          {msg.type === 'workflow' && (
                            <Badge variant="outline">Workflow Generated</Badge>
                          )}
                          {msg.type === 'error' && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{msg.content}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-lg p-3 w-fit max-w-[75%] bg-muted">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <div className="mt-4">
              <Textarea
                value={userMessage}
                onChange={handleUserMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="mb-2"
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                {isLoading ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Workflow Section */}
        {isWorkflowVisible && (
          <div className="w-1/2 p-4 border-r flex flex-col">
            <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
                <Input
                  type="text"
                  placeholder="Workflow Name"
                  value={workflowName}
                  onChange={handleWorkflowNameChange}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <ScrollArea ref={workflowRef} className="flex-grow">
                  {generatedWorkflow ? (
                    <pre className="text-sm">
                      <code>
                        {JSON.stringify(generatedWorkflow, null, 2)}
                      </code>
                    </pre>
                  ) : (
                    <div className="text-muted-foreground">No workflow generated yet.</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            <div className="mt-4 flex space-x-2">
              <Button variant="secondary" onClick={handleAnalyzeWorkflow} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze
              </Button>
              <Button variant="secondary" onClick={handleEditWorkflow} disabled={isLoading}>
                <Code className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleSaveWorkflow} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleLoadWorkflow} disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                Load
              </Button>
              <Button variant="outline" onClick={handleDownloadWorkflow} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={handleCopyWorkflow} disabled={isLoading}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {isSettingsVisible && (
          <div className="w-1/4 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credential-select">Select Credential</Label>
                    <Select onValueChange={handleCredentialChange}>
                      <SelectTrigger id="credential-select">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials && Object.keys(credentials).map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Workflow Context</Label>
                    <Button variant="outline" size="sm" onClick={toggleContextVisibility}>
                      {isContextVisible ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                      Edit Context
                    </Button>
                    {isContextVisible && (
                      <div className="mt-2">
                        {Object.keys(workflowContext).map(key => (
                          <div key={key} className="mb-2">
                            <Label htmlFor={`context-${key}`}>{key}</Label>
                            <Input
                              type="text"
                              id={`context-${key}`}
                              value={workflowContext[key]}
                              onChange={(e) => handleContextChange(key, e.target.value)}
                            />
                          </div>
                        ))}
                        <Button variant="secondary" size="sm" onClick={() => {
                          const newKey = prompt("Enter new context key:");
                          if (newKey) {
                            setWorkflowContext(prev => ({ ...prev, [newKey]: '' }));
                          }
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Context
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
