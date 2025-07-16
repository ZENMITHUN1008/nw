
import { supabase } from '../integrations/supabase/client';
import { N8nService } from './n8nService';

export interface AIWorkflowRequest {
  prompt: string;
  userContext?: any;
  n8nConnectionId?: string;
}

export interface AIWorkflowResponse {
  workflow: any;
  explanation: string;
  success: boolean;
  error?: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
}

export class AIService {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  async generateWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
    try {
      console.log('Generating workflow with prompt:', request.prompt);
      
      // Mock implementation for now
      const mockWorkflow = {
        id: `workflow_${Date.now()}`,
        name: `Generated Workflow - ${new Date().toLocaleDateString()}`,
        description: `Workflow generated from: ${request.prompt.substring(0, 50)}...`,
        nodes: [
          {
            id: 'start',
            type: 'Manual Trigger',
            name: 'Manual Trigger',
            parameters: {}
          },
          {
            id: 'process',
            type: 'Function',
            name: 'Process Data',
            parameters: {
              functionCode: `// Generated based on: ${request.prompt}\nreturn items;`
            }
          }
        ],
        connections: {
          'Manual Trigger': {
            main: [
              [
                {
                  node: 'Process Data',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        },
        settings: {
          executionOrder: 'v1'
        }
      };

      return {
        workflow: mockWorkflow,
        explanation: `Generated a workflow based on your request: "${request.prompt}". This workflow includes a manual trigger and a function node to process data according to your specifications.`,
        success: true
      };
    } catch (error) {
      console.error('Error generating workflow:', error);
      return {
        workflow: null,
        explanation: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async saveGeneratedWorkflow(workflow: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Since we don't have ai_generated_workflows table, we'll just log for now
      console.log('Would save workflow:', workflow);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save workflow' 
      };
    }
  }

  async getGeneratedWorkflows(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Since we don't have ai_generated_workflows table, return empty array
      console.log('Would fetch workflows for user:', user.id);
      return [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async getMCPServers(): Promise<MCPServerConfig[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map(server => ({
        id: server.id,
        name: server.name,
        url: server.url,
        status: server.status as 'connected' | 'disconnected' | 'error',
        tools: server.tools as string[] || []
      }));
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      return [];
    }
  }

  async addMCPServer(name: string, url: string, authToken?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('mcp_servers')
        .insert([{
          user_id: user.id,
          name,
          url,
          authorization_token: authToken,
          status: 'disconnected',
          tools: [],
          tool_configuration: { enabled: true }
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error adding MCP server:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add MCP server' 
      };
    }
  }

  async removeMCPServer(serverId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', serverId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing MCP server:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove MCP server' 
      };
    }
  }

  async testMCPConnection(serverId: string): Promise<{ success: boolean; error?: string; tools?: string[] }> {
    try {
      // Mock implementation - in real app, this would test the actual connection
      console.log('Testing MCP server connection:', serverId);
      
      return {
        success: true,
        tools: ['example-tool-1', 'example-tool-2']
      };
    } catch (error) {
      console.error('Error testing MCP connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  async generateWorkflowStream() {
    // Mock implementation for streaming
    return new ReadableStream({
      start(controller) {
        const chunks = [
          'Analyzing your request...\n',
          'Generating workflow structure...\n',
          'Adding nodes and connections...\n',
          'Finalizing workflow...\n',
          'Complete!'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
          if (index < chunks.length) {
            controller.enqueue(new TextEncoder().encode(chunks[index]));
            index++;
          } else {
            controller.close();
            clearInterval(interval);
          }
        }, 1000);
      }
    });
  }
}

export const aiService = new AIService('');
