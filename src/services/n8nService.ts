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

export class N8nService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async testConnection(baseUrl: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials or connection failed' };
      }
    } catch (error) {
      return { success: false, error: 'Connection failed' };
    }
  }

  async saveConnection(connection: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('n8n_connections')
        .insert([{
          user_id: connection.user_id,
          instance_name: connection.instance_name,
          base_url: connection.baseUrl,
          api_key: connection.api_key,
          is_active: connection.is_active,
          connection_status: connection.connection_status,
          version: connection.version,
          workflow_count: connection.workflow_count,
          execution_count: connection.execution_count,
          last_connected: connection.last_connected,
        }])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save connection' };
    }
  }

  async executeWorkflow(workflowId: string, data?: any): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      // Implementation for executing a workflow
      return { success: false, error: 'Not implemented yet' };
    } catch (error) {
      return { success: false, error: 'Execution failed' };
    }
  }

  async getExecutions(workflowId?: string): Promise<any[]> {
    try {
      // Implementation for getting executions
      return [];
    } catch (error) {
      console.error('Error getting executions:', error);
      return [];
    }
  }

  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      // Implementation for health check
      return { status: 'unknown' };
    } catch (error) {
      return { status: 'error' };
    }
  }
}
