
import { supabase } from '../integrations/supabase/client';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
  nodes: any[];
  connections: any[];
  settings: any;
  triggerCount: number;
  tags: string[];
}

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
  nodes: any[];
  connections: any[];
  settings: any;
  triggerCount: number;
  tags: string[];
}

export interface Connection {
  id: string;
  user_id: string;
  instance_name: string;
  baseUrl: string;
  api_key: string;
  is_active: boolean;
  connection_status: string;
  version: string | null;
  workflow_count: number | null;
  execution_count: number | null;
  created_at: string;
  updated_at: string;
  last_connected: string | null;
  status?: string;
  workflowCount?: number;
  lastConnected?: Date | string;
  name: string; // Add name property for compatibility
  createdAt?: Date; // Add createdAt for compatibility
}

export interface Execution {
  id: string;
  workflowId: string;
  startedAt: string;
  stoppedAt: string;
  status: string;
  data: any;
  error: any;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  startedAt: string;
  stoppedAt: string;
  status: string;
  data: any;
  error: any;
}

export class N8nService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async testConnection(baseUrl: string, apiKey: string, instanceName: string): Promise<{ success: boolean; error?: string; data?: any }> {
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
            workflowCount: data.data?.length || 0,
            version: '1.0.0'
          }
        };
      } else {
        return { success: false, error: 'Invalid credentials or connection failed' };
      }
    } catch (error) {
      return { success: false, error: 'Connection failed' };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('n8n_connections')
        .insert([{
          user_id: user.id,
          instance_name: instanceName,
          base_url: baseUrl,
          api_key: apiKey,
          is_active: true,
          connection_status: 'connected',
          version: version,
          workflow_count: workflowCount,
          execution_count: 0,
          last_connected: new Date().toISOString(),
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save connection' };
    }
  }

  async getConnections(): Promise<Connection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map(conn => ({
        ...conn,
        baseUrl: conn.base_url,
        name: conn.instance_name,
        status: conn.connection_status,
        workflowCount: conn.workflow_count,
        lastConnected: conn.last_connected,
        createdAt: new Date(conn.created_at)
      }));
    } catch (error) {
      console.error('Error getting connections:', error);
      return [];
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

  async getWorkflows(): Promise<Workflow[]> {
    return [];
  }

  async createWorkflow(workflow: any): Promise<Workflow> {
    throw new Error('Not implemented');
  }

  async updateWorkflow(workflowId: string, workflow: any): Promise<Workflow> {
    throw new Error('Not implemented');
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<Execution> {
    throw new Error('Not implemented');
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<Execution[]> {
    return [];
  }

  async healthCheck(): Promise<{ status: string; version?: string }> {
    return { status: 'unknown' };
  }
}

export const n8nService = new N8nService('', '');
