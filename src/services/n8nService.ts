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

export class N8nService {
  private baseUrl = `${supabase.supabaseUrl}/functions/v1/n8n-proxy`;

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
    return this.makeRequest('/workflows')
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

  // Legacy methods - consider refactoring to use the above methods
  async fetchWorkflows(baseUrl: string, apiKey: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async activateWorkflowLegacy(baseUrl: string, apiKey: string, workflowId: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deactivateWorkflowLegacy(baseUrl: string, apiKey: string, workflowId: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const n8nService = new N8nService();
