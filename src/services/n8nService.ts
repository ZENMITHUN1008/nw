
import { supabase } from "../integrations/supabase/client";

export interface N8nConnection {
  id: string;
  user_id: string;
  base_url: string;
  api_key: string;
  instance_name: string;
  workflow_count: number;
  last_connected: string;
  connection_status: string;
  is_active: boolean;
  version?: string;
  created_at?: string;
  updated_at?: string;
  execution_count?: number;
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
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: string;
}

export class N8nService {
  async getConnection(connectionId: string): Promise<N8nConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching n8n connection:', error);
        return null;
      }

      return data as N8nConnection;
    } catch (error) {
      console.error('Error fetching n8n connection:', error);
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

      if (error) {
        console.error('Error fetching n8n connections:', error);
        return [];
      }

      return data as N8nConnection[];
    } catch (error) {
      console.error('Error fetching n8n connections:', error);
      return [];
    }
  }

  async createConnection(baseUrl: string, apiKey: string, name: string): Promise<N8nConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert({
          user_id: user.id,
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: name
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating n8n connection:', error);
        return null;
      }

      return data as N8nConnection;
    } catch (error) {
      console.error('Error creating n8n connection:', error);
      return null;
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // First deactivate all existing connections
      await supabase
        .from('n8n_connections')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert({
          user_id: user.id,
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: instanceName,
          workflow_count: workflowCount || 0,
          version: version,
          is_active: true,
          connection_status: 'connected',
          last_connected: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error saving n8n connection:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error saving n8n connection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateConnection(connectionId: string, baseUrl: string, apiKey: string, name: string): Promise<N8nConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_connections')
        .update({
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: name
        })
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating n8n connection:', error);
        return null;
      }

      return data as N8nConnection;
    } catch (error) {
      console.error('Error updating n8n connection:', error);
      return null;
    }
  }

  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('n8n_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting n8n connection:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting n8n connection:', error);
      return false;
    }
  }

  async testConnection(baseUrl: string, apiKey: string, instanceName: string): Promise<{ success: boolean; error?: string; data?: any; message?: string }> {
    try {
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const workflows = await response.json();
      
      // Get n8n version
      let version = 'Unknown';
      try {
        const healthResponse = await fetch(`${baseUrl}/healthz`);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          version = healthData.version || 'Unknown';
        }
      } catch (e) {
        console.log('Could not fetch version');
      }

      return { 
        success: true, 
        message: 'Connection successful',
        data: { 
          workflowCount: workflows.data?.length || 0,
          version 
        }
      };
    } catch (error) {
      console.error('Error testing n8n connection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    // This would fetch workflows from n8n API
    // For now returning empty array as placeholder
    return [];
  }

  async createWorkflow(workflow: any): Promise<N8nWorkflow> {
    // This would create workflow via n8n API
    // For now returning the workflow as placeholder
    return workflow;
  }

  async updateWorkflow(workflow: any): Promise<N8nWorkflow> {
    // This would update workflow via n8n API
    return workflow;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    // This would delete workflow via n8n API
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    // This would activate workflow via n8n API
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    // This would deactivate workflow via n8n API
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    // This would execute workflow via n8n API
    return {};
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    // This would fetch executions from n8n API
    return [];
  }

  async setActiveConnection(connectionId: string): Promise<void> {
    try {
      localStorage.setItem('activeN8nConnectionId', connectionId);
    } catch (error) {
      console.error('Error setting active connection:', error);
    }
  }

  async getActiveConnectionId(): Promise<string | null> {
    try {
      return localStorage.getItem('activeN8nConnectionId');
    } catch (error) {
      console.error('Error getting active connection id:', error);
      return null;
    }
  }

  async getActiveConnection(): Promise<N8nConnection | null> {
    const connectionId = await this.getActiveConnectionId();
    if (!connectionId) return null;
    return this.getConnection(connectionId);
  }

  async deployWorkflow(workflow: any): Promise<any> {
    const connection = await this.getActiveConnection();
    if (!connection) {
      throw new Error('No active n8n connection found. Please connect to n8n first.');
    }

    try {
      console.log('Deploying workflow to n8n:', workflow.name);
      
      // Prepare workflow for deployment
      const deploymentWorkflow = {
        ...workflow,
        active: true, // Activate the workflow upon deployment
        settings: {
          ...workflow.settings,
          saveExecutionProgress: true,
          saveManualExecutions: true
        }
      };

      const response = await fetch(`${connection.base_url}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': connection.api_key,
        },
        body: JSON.stringify(deploymentWorkflow)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to deploy workflow: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Workflow deployed successfully:', result);
      
      // Update connection stats
      await this.updateConnectionStats(connection.id);
      
      return result;
    } catch (error) {
      console.error('Error deploying workflow:', error);
      throw error;
    }
  }

  private async updateConnectionStats(connectionId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Increment workflow count
      const { error } = await supabase
        .from('n8n_connections')
        .update({
          workflow_count: supabase.raw('COALESCE(workflow_count, 0) + 1'),
          last_connected: new Date().toISOString()
        })
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating connection stats:', error);
      }
    } catch (error) {
      console.error('Error updating connection stats:', error);
    }
  }

  async healthCheck(): Promise<{ status: string; message?: string }> {
    try {
      const connection = await this.getActiveConnection();
      if (!connection) {
        return { status: 'error', message: 'No active connection' };
      }

      const response = await fetch(`${connection.base_url}/healthz`);
      if (response.ok) {
        return { status: 'ok' };
      } else {
        return { status: 'error', message: 'Health check failed' };
      }
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'Health check failed' };
    }
  }
}

export const n8nService = new N8nService();
