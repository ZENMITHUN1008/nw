
import { supabase } from "@/integrations/supabase/client";

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
  description: string;
  requirements?: string[];
  integrations?: string[];
}

class AIService {
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.apiKey = null;
      }
    } catch (error) {
      console.warn('Could not load user settings for API key');
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing AI connection:', error);
      return false;
    }
  }

  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: `You are an n8n workflow automation expert. Generate detailed n8n workflows based on user requirements. 
              Return a JSON response with:
              1. workflow: Complete n8n workflow JSON
              2. explanation: Clear explanation of what the workflow does
              3. estimatedComplexity: 'low', 'medium', or 'high'`
            },
            {
              role: 'user',
              content: `Create an n8n workflow for: ${request.description}
              ${request.requirements ? `Requirements: ${request.requirements.join(', ')}` : ''}
              ${request.integrations ? `Integrations needed: ${request.integrations.join(', ')}` : ''}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(content);
      } catch {
        return {
          workflow: {
            name: "Generated Workflow",
            nodes: [],
            connections: {}
          },
          explanation: content,
          estimatedComplexity: 'medium' as const
        };
      }
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }

  async generateWorkflowStream(request: AIWorkflowRequest): Promise<AsyncGenerator<string, void, unknown>> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an n8n workflow automation expert. Generate detailed n8n workflows based on user requirements.`
          },
          {
            role: 'user',
            content: `Create an n8n workflow for: ${request.description}
            ${request.requirements ? `Requirements: ${request.requirements.join(', ')}` : ''}
            ${request.integrations ? `Integrations needed: ${request.integrations.join(', ')}` : ''}`
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    return this.streamResponse(reader);
  }

  private async* streamResponse(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string, void, unknown> {
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
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
  }

  async chat(messages: ChatMessage[]): Promise<ChatMessage> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI service');
      }

      return {
        role: 'assistant',
        content,
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
          messages: messages,
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

      return data.messages as ChatMessage[];
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
