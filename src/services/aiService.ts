import { supabase } from "../integrations/supabase/client";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WorkflowGenerationRequest {
  description: string;
  requirements?: string[];
  integrations?: string[];
}

export interface WorkflowGenerationResponse {
  workflow: any;
  explanation: string;
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface AIWorkflowRequest {
  description?: string;
  requirements?: string[];
  integrations?: string[];
  message?: string;
  chatHistory?: ChatMessage[];
  selectedWorkflow?: any;
  action?: 'generate' | 'analyze' | 'edit' | 'chat';
  workflowContext?: any;
}

export interface StreamChunk {
  type: 'text' | 'workflow' | 'error' | 'complete' | 'tool_start' | 'tool_input' | 'tool_result';
  content: string | any;
}

// Supabase configuration constants
const SUPABASE_URL = "https://kqemyueobhimorhdxodh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZW15dWVvYmhpbW9yaGR4b2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDU5MjEsImV4cCI6MjA2ODIyMTkyMX0.maTYK02fvFR-qfqqQaI0O_LxCJ8tHZ1MBLvZkJcqfhk";

class AIService {
  async testConnection(): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('workflow-generator', {
        body: { 
          message: 'test connection',
          action: 'chat'
        }
      });

      return !response.error;
    } catch (error) {
      console.error('Error testing AI connection:', error);
      return false;
    }
  }

  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    try {
      const response = await supabase.functions.invoke('workflow-generator', {
        body: {
          message: request.description,
          requirements: request.requirements,
          integrations: request.integrations,
          action: 'generate'
        }
      });

      if (response.error) {
        throw new Error(`AI service error: ${response.error.message}`);
      }

      return {
        workflow: response.data?.workflow || {
          name: "Generated Workflow",
          nodes: [],
          connections: {}
        },
        explanation: response.data?.explanation || 'Workflow generated successfully',
        estimatedComplexity: response.data?.estimatedComplexity || 'medium'
      };
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }

  async *generateWorkflowStream(request: AIWorkflowRequest): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/workflow-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: request.message || request.description,
          chatHistory: request.chatHistory,
          selectedWorkflow: request.selectedWorkflow,
          action: request.action || 'generate',
          workflowContext: request.workflowContext
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            yield { type: 'complete', content: '' };
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                yield { type: 'complete', content: '' };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.type && parsed.content) {
                  yield parsed as StreamChunk;
                }
              } catch (e) {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error in streaming workflow generation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      yield { type: 'error', content: errorMessage };
    }
  }

  async chat(messages: ChatMessage[]): Promise<ChatMessage> {
    try {
      const response = await supabase.functions.invoke('workflow-generator', {
        body: {
          message: messages[messages.length - 1]?.content || '',
          chatHistory: messages.slice(0, -1),
          action: 'chat'
        }
      });

      if (response.error) {
        throw new Error(`AI service error: ${response.error.message}`);
      }

      return {
        role: 'assistant',
        content: response.data?.content || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async saveConversation(sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          messages: messages as any,
          context: {
            active_workflows: [],
            user_preferences: {},
            recent_actions: []
          }
        });

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async loadConversation(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (error || !data) return [];

      return data.messages as unknown as ChatMessage[];
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
