
import { supabase } from "@/integrations/supabase/client";

export interface N8nConnection {
  id?: string;
  instance_name: string;
  base_url: string;
  api_key: string;
  is_active?: boolean;
  connection_status?: 'connected' | 'disconnected' | 'error';
  version?: string;
  workflow_count?: number;
  execution_count?: number;
  last_connected?: string;
  created_at?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: any[];
  connections: any;
  tags?: string[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: 'success' | 'error' | 'waiting' | 'running';
  startedAt: string;
  stoppedAt?: string;
  data?: any;
}

export interface N8nServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class N8nService {
  async testConnection(baseUrl: string, apiKey: string, _instanceName: string): Promise<N8nServiceResponse<{ version?: string; workflowCount?: number }>> {
    try {
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: {
            workflowCount: data.data?.length || 0
          }
        };
      }

      return {
        success: false,
        data: {},
        error: 'Connection failed'
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<N8nServiceResponse<N8nConnection>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert([
          {
            base_url: baseUrl,
            api_key: apiKey,
            instance_name: instanceName,
            user_id: user.id,
            workflow_count: workflowCount || 0,
            version: version,
            connection_status: 'connected'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        data: {} as N8nConnection,
        error: error instanceof Error ? error.message : 'Failed to save connection'
      };
    }
  }

  async getConnections(): Promise<N8nServiceResponse<N8nConnection[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: true, data: [] };

      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch connections'
      };
    }
  }

  async updateConnection(id: string, updates: Partial<N8nConnection>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('n8n_connections')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      return !error;
    } catch (error) {
      console.error('Error updating n8n connection:', error);
      return false;
    }
  }

  async deleteConnection(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('n8n_connections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting n8n connection:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        return [];
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        return [];
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async createWorkflow(workflow: any): Promise<N8nWorkflow> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId: string, workflow: any): Promise<N8nWorkflow> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to activate workflow');
      }
    } catch (error) {
      console.error('Error activating workflow:', error);
      throw error;
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows/${workflowId}/deactivate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate workflow');
      }
    } catch (error) {
      console.error('Error deactivating workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        throw new Error('No active connection');
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const response = await fetch(`${activeConnection.base_url}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        return [];
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        return [];
      }

      let url = `${activeConnection.base_url}/api/v1/executions?limit=${limit}`;
      if (workflowId) {
        url += `&workflowId=${workflowId}`;
      }

      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  }

  async healthCheck(): Promise<{ status: string; message?: string }> {
    try {
      const connectionsResponse = await this.getConnections();
      if (!connectionsResponse.success || connectionsResponse.data.length === 0) {
        return { status: 'error', message: 'No connections available' };
      }

      const activeConnection = connectionsResponse.data.find(c => c.is_active);
      if (!activeConnection) {
        return { status: 'error', message: 'No active connection' };
      }

      const response = await fetch(`${activeConnection.base_url}/healthz`, {
        headers: {
          'X-N8N-API-KEY': activeConnection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok ? { status: 'ok' } : { status: 'error', message: 'Health check failed' };
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'error', message: error instanceof Error ? error.message : 'Health check failed' };
    }
  }
}

export const n8nService = new N8nService();
