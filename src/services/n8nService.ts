
import { supabase } from '../integrations/supabase/client';

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: any[];
  connections: any[];
  settings: any;
  version: number;
  description: string | null;
  tags: string[] | null;
  graph?: any;
}

export interface Connection {
  id: string;
  name: string;
  type: string;
  nodes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Credentials {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy interfaces for compatibility
export interface N8nWorkflow extends Workflow {}
export interface N8nConnection extends Connection {}
export interface N8nExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data: any;
}

export class N8nService {
  private baseUrl = 'https://kqemyueobhimorhdxodh.supabase.co/functions/v1/n8n-proxy';

  private async makeRequest(path: string, method: string = 'GET', body?: any, headers?: Record<string, string>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const requestPayload = {
        path,
        method,
        body,
        headers
      };

      console.log('Making n8n request:', requestPayload);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8n proxy error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('N8n response:', data);
      return data;
    } catch (error) {
      console.error('N8n request failed:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<Workflow[]> {
    const workflows = await this.makeRequest('/workflows');
    return workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      nodes: w.nodes || [],
      connections: w.connections || {},
      active: w.active || false,
      tags: w.tags || [],
      createdAt: new Date(w.createdAt || Date.now()),
      updatedAt: new Date(w.updatedAt || Date.now()),
      settings: w.settings || {},
      version: w.version || 1,
      graph: w.graph || {}
    }));
  }

  async createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow> {
    return this.makeRequest('/workflows', 'POST', workflowData);
  }

  async updateWorkflow(workflowId: string, workflowData: Partial<Workflow>): Promise<Workflow> {
    return this.makeRequest(`/workflows/${workflowId}`, 'PUT', workflowData);
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    return this.makeRequest(`/workflows/${workflowId}`, 'DELETE');
  }

  async deployWorkflow(workflow: any): Promise<any> {
    try {
      console.log('Deploying workflow to n8n:', workflow);
      
      // First create the workflow
      const createResult = await this.makeRequest('/workflows', 'POST', workflow);
      
      if (createResult && createResult.id) {
        console.log('Workflow created successfully:', createResult);
        
        // If the workflow should be active, activate it
        if (workflow.active) {
          try {
            await this.makeRequest(`/workflows/${createResult.id}/activate`, 'POST');
            console.log('Workflow activated successfully');
          } catch (activationError) {
            console.warn('Failed to activate workflow, but creation succeeded:', activationError);
          }
        }
        
        return { 
          success: true, 
          id: createResult.id, 
          workflow: createResult 
        };
      } else {
        throw new Error('No workflow ID returned from n8n');
      }
    } catch (error) {
      console.error('Failed to deploy workflow:', error);
      throw error;
    }
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    return this.makeRequest(`/workflows/${workflowId}/activate`, 'POST');
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    return this.makeRequest(`/workflows/${workflowId}/deactivate`, 'POST');
  }

  async getConnections(): Promise<Connection[]> {
    return this.makeRequest('/connections');
  }

  async createConnection(connectionData: Partial<Connection>): Promise<Connection> {
    return this.makeRequest('/connections', 'POST', connectionData);
  }

  async updateConnection(connectionId: string, connectionData: Partial<Connection>): Promise<Connection> {
    return this.makeRequest(`/connections/${connectionId}`, 'PUT', connectionData);
  }

  async deleteConnection(connectionId: string): Promise<void> {
    return this.makeRequest(`/connections/${connectionId}`, 'DELETE');
  }

  async getCredentials(): Promise<Credentials[]> {
    return this.makeRequest('/credentials');
  }

  // Additional methods for compatibility with useN8n hook
  async testConnection(baseUrl: string, apiKey: string, instanceName: string): Promise<any> {
    try {
      const response = await this.makeRequest('/test', 'POST', { baseUrl, apiKey, instanceName });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection test failed' };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert({
          user_id: user.id,
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: instanceName,
          workflow_count: workflowCount || 0,
          version: version || 'unknown',
          is_active: true,
          connection_status: 'connected'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save connection' };
    }
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<N8nExecution> {
    const response = await this.makeRequest(`/workflows/${workflowId}/execute`, 'POST', data);
    return response;
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    const path = workflowId ? `/workflows/${workflowId}/executions?limit=${limit}` : `/executions?limit=${limit}`;
    return this.makeRequest(path);
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.makeRequest('/health');
      return { status: 'ok', data: response };
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'Health check failed' };
    }
  }

  // Legacy methods - consider refactoring to use the above methods
  async fetchWorkflows(_baseUrl: string, _apiKey: string): Promise<any> {
    return this.getWorkflows();
  }

  async activateWorkflowLegacy(_baseUrl: string, _apiKey: string, workflowId: string): Promise<any> {
    return this.activateWorkflow(workflowId);
  }

  async deactivateWorkflowLegacy(_baseUrl: string, _apiKey: string, workflowId: string): Promise<any> {
    return this.deactivateWorkflow(workflowId);
  }
}

export const n8nService = new N8nService();
