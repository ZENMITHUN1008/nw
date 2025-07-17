
import { supabase } from '../integrations/supabase/client';

export interface N8nConnection {
  id: string;
  user_id: string;
  instance_name: string;
  base_url: string;
  api_key: string;
  workflow_count: number | null;
  version: string | null;
  connection_status: string; // Changed to string to match database
  is_active: boolean;
  created_at: string;
  last_connected: string | null;
  updated_at: string;
  execution_count: number | null;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf: null | string;
  retrySuccessId: null | string;
  startedAt: Date;
  stoppedAt: Date;
  finished: boolean;
  status: string;
  data: any;
}

class N8nService {
  private connections: N8nConnection[] = [];

  async getConnections(): Promise<N8nConnection[]> {
    try {
      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.connections = data || [];
      return this.connections;
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Mock test - in real implementation, this would call n8n API
      return {
        success: true,
        data: {
          workflowCount: 5,
          version: '1.0.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<{ success: boolean; error?: string; data?: N8nConnection }> {
    try {
      // First deactivate all other connections
      await supabase
        .from('n8n_connections')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const connectionData = {
        user_id: user.id,
        instance_name: instanceName,
        base_url: baseUrl,
        api_key: apiKey,
        workflow_count: workflowCount || 0,
        version: version || null,
        connection_status: 'connected',
        is_active: true,
        last_connected: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error saving connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save connection'
      };
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('n8n_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    // Mock implementation - return empty array for now
    return [];
  }

  async createWorkflow(workflow: any): Promise<N8nWorkflow> {
    // Mock implementation
    return {
      id: '1',
      name: workflow.name,
      active: false,
      nodes: workflow.nodes || [],
      connections: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateWorkflow(workflow: any): Promise<N8nWorkflow> {
    // Mock implementation
    return {
      id: workflow.id,
      name: workflow.name,
      active: false,
      nodes: workflow.nodes || [],
      connections: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async deleteWorkflow(): Promise<void> {
    // Mock implementation
    console.log('Deleting workflow');
  }

  async activateWorkflow(): Promise<void> {
    // Mock implementation
    console.log('Activating workflow');
  }

  async deactivateWorkflow(): Promise<void> {
    // Mock implementation
    console.log('Deactivating workflow');
  }

  async executeWorkflow(): Promise<N8nExecution> {
    // Mock implementation
    console.log('Executing workflow');
    return {
      id: '1',
      workflowId: '1',
      mode: 'manual',
      retryOf: null,
      retrySuccessId: null,
      startedAt: new Date(),
      stoppedAt: new Date(),
      finished: true,
      status: 'success',
      data: {}
    };
  }

  async getExecutions(): Promise<N8nExecution[]> {
    // Mock implementation
    console.log('Getting executions');
    return [];
  }

  async healthCheck(): Promise<{ status: string; message?: string }> {
    return { status: 'ok' };
  }

  async deployWorkflow(): Promise<any> {
    // Mock implementation
    return { success: true, workflowId: '1' };
  }
}

export const n8nService = new N8nService();
