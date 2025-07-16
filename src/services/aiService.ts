import { supabase } from "../integrations/supabase/client";
import { n8nService } from "./n8nService";

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
  deploymentResult?: any;
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
  autoDeployToN8n?: boolean;
}

export interface StreamChunk {
  type: 'text' | 'workflow' | 'error' | 'complete' | 'deployment' | 'tool_start' | 'tool_input' | 'tool_result';
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

      const workflow = response.data?.workflow || {
        name: "Generated Workflow",
        nodes: [],
        connections: {}
      };

      let deploymentResult = null;
      
      // Auto-deploy to n8n if workflow was generated successfully
      if (workflow && workflow.nodes && workflow.nodes.length > 0) {
        try {
          console.log('Auto-deploying workflow to n8n...');
          deploymentResult = await n8nService.createWorkflow(workflow);
          console.log('Workflow deployed successfully:', deploymentResult);
        } catch (deployError) {
          console.error('Failed to deploy workflow to n8n:', deployError);
          const errorMessage = deployError instanceof Error ? deployError.message : String(deployError);
          deploymentResult = { error: errorMessage };
        }
      }

      return {
        workflow,
        explanation: response.data?.explanation || 'Workflow generated successfully',
        estimatedComplexity: response.data?.estimatedComplexity || 'medium',
        deploymentResult
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
        if (response.data.content || response.data.explanation) {
          yield { type: 'text', content: response.data.content || response.data.explanation };
        }
        
        if (response.data.workflow) {
          yield { type: 'workflow', content: response.data.workflow };
          
          // Auto-deploy to n8n if enabled and workflow is valid
          if (request.autoDeployToN8n !== false && response.data.workflow.nodes && response.data.workflow.nodes.length > 0) {
            try {
              yield { type: 'deployment', content: 'Deploying workflow to n8n...' };
              const deploymentResult = await n8nService.createWorkflow(response.data.workflow);
              yield { type: 'deployment', content: `✅ Workflow deployed successfully to n8n! ID: ${deploymentResult.id}` };
            } catch (deployError) {
              console.error('Failed to deploy workflow to n8n:', deployError);
              const errorMessage = deployError instanceof Error ? deployError.message : String(deployError);
              yield { type: 'deployment', content: `❌ Failed to deploy to n8n: ${errorMessage}` };
            }
          }
        }
      }

      yield { type: 'complete', content: '' };
      
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

  async deployWorkflowToN8n(workflow: any): Promise<any> {
    try {
      console.log('Deploying workflow to n8n:', workflow.name);
      const result = await n8nService.createWorkflow(workflow);
      console.log('Deployment successful:', result);
      return result;
    } catch (error) {
      console.error('Deployment failed:', error);
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
