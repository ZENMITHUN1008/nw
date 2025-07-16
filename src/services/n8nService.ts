
import { supabase } from "../integrations/supabase/client";

export interface N8nWorkflow {
  id?: string;
  name: string;
  description?: string;
  graph: any;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  instanceId?: string;
  active?: boolean;
  nodes?: any[];
  tags?: string[];
}

export interface N8nInstance {
  id?: string;
  name: string;
  url: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface N8nConnection {
  id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  isActive?: boolean;
  status?: string;
  version?: string;
  workflowCount?: number;
  executionCount?: number;
  lastConnected?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface N8nExecution {
  id?: string;
  workflowId: string;
  status: string;
  startedAt?: Date;
  finishedAt?: Date;
  data?: any;
  error?: string;
}

class N8nService {
  private async makeN8nRequest(path: string, options: RequestInit = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: `/proxy${path}`,
          method: options.method || 'GET',
          body: options.body,
          headers: options.headers
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('N8N API request failed:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.makeN8nRequest('/workflows');
      const workflows = response.data || response;
      
      return Array.isArray(workflows) ? workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        active: workflow.active || false,
        tags: workflow.tags || [],
        createdAt: workflow.createdAt ? new Date(workflow.createdAt) : new Date(),
        updatedAt: workflow.updatedAt ? new Date(workflow.updatedAt) : new Date()
      })) : [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async createWorkflow(workflow: any): Promise<any> {
    try {
      const workflowData = {
        name: workflow.name,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        active: false,
        settings: workflow.settings || {},
        staticData: workflow.staticData || {},
        tags: workflow.tags || []
      };

      const response = await this.makeN8nRequest('/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      console.log('Workflow created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflow: any): Promise<any> {
    try {
      if (!workflow.id) {
        throw new Error('Workflow ID is required for update');
      }

      const workflowData = {
        name: workflow.name,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        active: workflow.active || false,
        settings: workflow.settings || {},
        staticData: workflow.staticData || {},
        tags: workflow.tags || []
      };

      const response = await this.makeN8nRequest(`/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      console.log('Workflow updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.makeN8nRequest(`/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      console.log('Workflow deleted successfully:', workflowId);
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.makeN8nRequest(`/workflows/${workflowId}/activate`, {
        method: 'POST'
      });

      console.log('Workflow activated successfully:', workflowId);
    } catch (error) {
      console.error('Error activating workflow:', error);
      throw error;
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.makeN8nRequest(`/workflows/${workflowId}/deactivate`, {
        method: 'POST'
      });

      console.log('Workflow deactivated successfully:', workflowId);
    } catch (error) {
      console.error('Error deactivating workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    try {
      const response = await this.makeN8nRequest(`/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('Workflow executed successfully:', response);
      return response;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    try {
      const path = workflowId ? `/executions?workflowId=${workflowId}&limit=${limit}` : `/executions?limit=${limit}`;
      const response = await this.makeN8nRequest(path);
      const executions = response.data || response;
      
      return Array.isArray(executions) ? executions.map(execution => ({
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.finished ? 'success' : execution.stoppedAt ? 'error' : 'running',
        startedAt: execution.startedAt ? new Date(execution.startedAt) : undefined,
        finishedAt: execution.finishedAt ? new Date(execution.finishedAt) : undefined,
        data: execution.data,
        error: execution.error
      })) : [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.makeN8nRequest('/health');
      return { status: 'ok', data: response };
    } catch (error) {
      console.error('Error in health check:', error);
      return { status: 'error', message: error instanceof Error ? error.message : 'Health check failed' };
    }
  }

  // Connection Management Methods
  async getConnections(): Promise<N8nConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const response = await supabase.functions.invoke('n8n-proxy', {
        body: { path: '/connections' }
      });

      if (response.error) {
        console.error('Error fetching connections:', response.error);
        return [];
      }

      const connections = response.data?.data || [];
      return connections.map((conn: any) => ({
        id: conn.id,
        name: conn.instance_name,
        baseUrl: conn.base_url,
        apiKey: conn.api_key,
        isActive: conn.is_active,
        status: conn.connection_status,
        version: conn.version || undefined,
        workflowCount: conn.workflow_count || undefined,
        executionCount: conn.execution_count || undefined,
        lastConnected: conn.last_connected ? new Date(conn.last_connected) : undefined,
        createdAt: new Date(conn.created_at),
        updatedAt: new Date(conn.updated_at),
        userId: conn.user_id
      }));
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  }

  async testConnection(baseUrl: string, apiKey: string, instanceName: string): Promise<any> {
    try {
      const response = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: '/test-connection',
          baseUrl,
          apiKey,
          instanceName
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<any> {
    try {
      const response = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: '/save-connection',
          baseUrl,
          apiKey,
          instanceName,
          workflowCount,
          version
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const response = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: `/connections/${connectionId}`,
          method: 'DELETE'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async saveWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow | null> {
    try {
      const result = await this.createWorkflow(workflow);
      return result;
    } catch (error) {
      console.error('Error saving workflow:', error);
      return null;
    }
  }

  async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    try {
      const response = await this.makeN8nRequest(`/workflows/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  async saveInstance(instance: N8nInstance): Promise<N8nInstance | null> {
    // This is now handled by connections
    return null;
  }

  async updateInstance(instance: N8nInstance): Promise<N8nInstance | null> {
    // This is now handled by connections
    return null;
  }

  async getInstance(id: string): Promise<N8nInstance | null> {
    // This is now handled by connections
    return null;
  }

  async getInstances(): Promise<N8nInstance[]> {
    // This is now handled by connections
    return [];
  }

  async deleteInstance(id: string): Promise<boolean> {
    // This is now handled by connections
    return false;
  }
}

export const n8nService = new N8nService();
