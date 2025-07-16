
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

class N8nService {
  async testConnection(connection: Omit<N8nConnection, 'id'>): Promise<boolean> {
    try {
      const response = await fetch(`${connection.base_url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing n8n connection:', error);
      return false;
    }
  }

  async saveConnection(connection: Omit<N8nConnection, 'id'>): Promise<N8nConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert([
          {
            ...connection,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving n8n connection:', error);
      return null;
    }
  }

  async getConnections(): Promise<N8nConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching n8n connections:', error);
      return [];
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

  async deleteConnection(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('n8n_connections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      return !error;
    } catch (error) {
      console.error('Error deleting n8n connection:', error);
      return false;
    }
  }

  async getWorkflows(connectionId: string): Promise<N8nWorkflow[]> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': connection.api_key,
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

  async getWorkflowExecutions(connectionId: string, workflowId: string): Promise<N8nExecution[]> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(
        `${connection.base_url}/api/v1/executions?workflowId=${workflowId}`,
        {
          headers: {
            'X-N8N-API-KEY': connection.api_key,
            'Content-Type': 'application/json',
          },
        }
      );

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

  async createWorkflow(connectionId: string, workflow: any): Promise<N8nWorkflow | null> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
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
      return null;
    }
  }

  async updateWorkflow(connectionId: string, workflowId: string, workflow: any): Promise<N8nWorkflow | null> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
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
      return null;
    }
  }

  async executeWorkflow(connectionId: string, workflowId: string): Promise<any> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
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

  // Add missing methods for compatibility
  async deleteWorkflow(connectionId: string, workflowId: string): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  async activateWorkflow(connectionId: string, workflowId: string): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error activating workflow:', error);
      return false;
    }
  }

  async deactivateWorkflow(connectionId: string, workflowId: string): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/workflows/${workflowId}/deactivate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deactivating workflow:', error);
      return false;
    }
  }

  async getExecutions(connectionId: string): Promise<N8nExecution[]> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      const response = await fetch(`${connection.base_url}/api/v1/executions`, {
        headers: {
          'X-N8N-API-KEY': connection.api_key,
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

  async healthCheck(connectionId: string): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        return false;
      }

      const response = await fetch(`${connection.base_url}/healthz`, {
        headers: {
          'X-N8N-API-KEY': connection.api_key,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking health:', error);
      return false;
    }
  }
}

export const n8nService = new N8nService();
