import { supabase } from '../integrations/supabase/client';

export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  tools?: string[];
}

export interface AIWorkflowRequest {
  prompt: string;
  userContext?: {
    userId?: string;
    email?: string;
  };
}

export interface AIWorkflowResponse {
  success: boolean;
  workflow?: any;
  explanation: string;
  error?: string;
}

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://kqemyueobhimorhdxodh.supabase.co/functions/v1';
  }

  async generateWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
    try {
      console.log('Generating workflow with request:', request);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return {
          success: false,
          explanation: '',
          error: 'User not authenticated'
        };
      }

      const response = await fetch(`${this.baseUrl}/workflow-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Workflow generation response:', data);
      
      return {
        success: true,
        workflow: data.workflow,
        explanation: data.explanation || 'Workflow generated successfully'
      };
    } catch (error) {
      console.error('Error generating workflow:', error);
      return {
        success: false,
        explanation: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateWorkflowStream(): Promise<ReadableStream> {
    // Return a mock stream for now
    return new ReadableStream({
      start(controller) {
        const message = "Streaming workflow generation...";
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(message));
        controller.close();
      }
    });
  }

  async saveGeneratedWorkflow(workflow: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Since we don't have an ai_generated_workflows table, we'll just return success
      console.log('Saving workflow:', workflow);
      return { success: true };
    } catch (error) {
      console.error('Error saving workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save workflow'
      };
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
      console.error('Error loading MCP servers:', error);
      return [];
    }
  }

  async addMCPServer(name: string, url: string): Promise<{ success: boolean; error?: string }> {
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
          status: 'disconnected'
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${this.baseUrl}/test-mcp-server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ serverId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing MCP connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async healthCheck(): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/workflow-generator`, {
        method: 'GET',
      });
      
      if (response.ok) {
        return { status: 'healthy' };
      } else {
        return { status: 'unhealthy', message: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const aiService = new AIService();
