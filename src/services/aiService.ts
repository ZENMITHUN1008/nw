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
      // Use supabase.functions.invoke for proper authentication
      const response = await supabase.functions.invoke('workflow-generator', {
        body: {
          message: request.message || request.description,
          chatHistory: request.chatHistory,
          selectedWorkflow: request.selectedWorkflow,
          action: request.action || 'generate',
          workflowContext: request.workflowContext
        }
      });

      if (response.error) {
        throw new Error(`AI service error: ${response.error.message}`);
      }

      // Since we're not getting a stream from supabase.functions.invoke,
      // we'll yield the complete response
      if (response.data) {
        if (response.data.workflow) {
          yield { type: 'workflow', content: response.data.workflow };
        }
        
        if (response.data.content || response.data.explanation) {
          yield { type: 'text', content: response.data.content || response.data.explanation };
        }

        // Add workflow summary after the main content
        if (response.data.workflow) {
          const summary = this.generateWorkflowSummary(response.data.workflow);
          yield { type: 'text', content: summary };
        }
      }

      yield { type: 'complete', content: '' };
      
    } catch (error) {
      console.error('Error in streaming workflow generation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      yield { type: 'error', content: errorMessage };
    }
  }

  private generateWorkflowSummary(workflow: any): string {
    if (!workflow || !workflow.nodes) return '';

    const nodeCount = workflow.nodes.length;
    const services = workflow.nodes.map((node: any) => {
      if (node.type.includes('googleSheets')) return 'Google Sheets';
      if (node.type.includes('youtube')) return 'YouTube';
      if (node.type.includes('telegram')) return 'Telegram';
      if (node.type.includes('slack')) return 'Slack';
      if (node.type.includes('gmail')) return 'Gmail';
      if (node.type.includes('webhook')) return 'Webhook';
      return node.type.replace('n8n-nodes-base.', '');
    });

    const uniqueServices = [...new Set(services)];
    
    return `\n\n🎉 **Workflow Summary:**
- **Name:** ${workflow.name || 'AI Generated Workflow'}
- **Nodes:** ${nodeCount} automation steps
- **Services:** ${uniqueServices.join(', ')}
- **Status:** Ready for credential configuration and deployment

📋 **Next Steps:**
1. Review the workflow components above
2. Provide required API credentials in the form below
3. Deploy directly to your n8n instance

The workflow is now ready to be configured with your credentials and deployed!`;
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
