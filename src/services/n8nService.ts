import { supabase } from '../lib/supabase';

export interface N8nConnection {
  id: string;
  user_id: string;
  instance_name: string;
  base_url: string;
  api_key: string;
  is_active: boolean;
  last_connected: string | null;
  connection_status: 'connected' | 'disconnected' | 'error';
  version: string | null;
  workflow_count: number;
  execution_count: number;
  created_at: string;
  updated_at: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt: string | null;
  data: any;
}

class N8nService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  // Use Supabase Edge Function proxy for all n8n API calls
  private async makeProxiedN8nRequest(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders();
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${baseUrl}/functions/v1/n8n-proxy/proxy${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Database operations
  // @ts-expect-error - keeping for future functionality
  private async _saveConnectionToDb(connection: Partial<N8nConnection>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First, deactivate any existing active connections
    await supabase
      .from('n8n_connections')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Save new connection
    const { data, error } = await supabase
      .from('n8n_connections')
      .insert({
        user_id: user.id,
        instance_name: connection.instance_name,
        base_url: connection.base_url,
        api_key: connection.api_key,
        is_active: true,
        last_connected: new Date().toISOString(),
        connection_status: 'connected',
        version: connection.version || 'Unknown',
        workflow_count: connection.workflow_count || 0,
        execution_count: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Connection Management - Use dedicated proxy endpoints
  async testConnection(baseUrl: string, apiKey: string, instanceName: string) {
    try {
      console.log('Testing n8n connection:', { baseUrl, instanceName });
      
      const headers = await this.getAuthHeaders();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/n8n-proxy/test-connection`;
      
      // Debug logging
      console.log('VITE_SUPABASE_URL:', supabaseUrl);
      console.log('Constructed URL:', url);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
          apiKey,
          instanceName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Test connection failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Connection test result:', result);

      return result;

    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/n8n-proxy/save-connection`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          baseUrl: baseUrl.replace(/\/$/, ''),
          apiKey,
          instanceName,
          workflowCount: workflowCount || 0,
          version: version || 'Unknown'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Save connection failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      return result;

    } catch (error) {
      console.error('Save connection failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save connection'
      };
    }
  }

  async getConnections(): Promise<{ success: boolean; data: N8nConnection[] }> {
    try {
      const headers = await this.getAuthHeaders();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/n8n-proxy/connections`;
      
      // Debug logging
      console.log('Getting connections from:', url);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('Get connections response status:', response.status);
      console.log('Get connections response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get connections error text:', errorText);
        throw new Error(`Get connections failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Get connections result:', result);
      return result;

    } catch (error) {
      console.error('Get connections failed:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  async deleteConnection(connectionId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/n8n-proxy/connections/${connectionId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete connection failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete connection'
      };
    }
  }

  // Get active connection for API calls
  private async getActiveConnection(): Promise<N8nConnection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('n8n_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error('No active n8n connection found. Please connect your n8n instance first.');
    }

    return data;
  }

  // Workflow Management - Use proxy
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.makeProxiedN8nRequest('/workflows');
      
      // Update last connected timestamp
      const connection = await this.getActiveConnection();
      await supabase
        .from('n8n_connections')
        .update({ 
          last_connected: new Date().toISOString(),
          connection_status: 'connected'
        })
        .eq('id', connection.id);

      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Get workflows failed:', error);
      throw error;
    }
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}`);
  }

  async createWorkflow(workflow: any): Promise<N8nWorkflow> {
    return this.makeProxiedN8nRequest('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(workflowId: string, workflow: any): Promise<N8nWorkflow> {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(workflowId: string) {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  async activateWorkflow(workflowId: string) {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(workflowId: string) {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}/deactivate`, {
      method: 'POST',
    });
  }

  async executeWorkflow(workflowId: string, data: any = {}) {
    return this.makeProxiedN8nRequest(`/workflows/${workflowId}/run`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Execution Management
  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    const params = new URLSearchParams();
    if (workflowId) params.append('filter', JSON.stringify({ workflowId }));
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.makeProxiedN8nRequest(`/executions${query}`);
    
    return Array.isArray(response) ? response : response.data || [];
  }

  async getExecution(executionId: string): Promise<N8nExecution> {
    return this.makeProxiedN8nRequest(`/executions/${executionId}`);
  }

  // Utility Methods
  async getActiveWorkflows() {
    return this.makeProxiedN8nRequest('/active-workflows');
  }

  async getCredentials() {
    return this.makeProxiedN8nRequest('/credentials');
  }

  async getCredentialTypes() {
    return this.makeProxiedN8nRequest('/credential-types');
  }

  async getNodeTypes() {
    return this.makeProxiedN8nRequest('/node-types');
  }

  // Health Check
  async healthCheck() {
    try {
      await this.makeProxiedN8nRequest('/workflows?limit=1');
      return { status: 'connected', message: 'n8n instance is reachable' };
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const n8nService = new N8nService();