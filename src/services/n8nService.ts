import { supabase } from '@/integrations/supabase/client';

export interface N8nConnection {
  id: string;
  user_id: string;
  base_url: string;
  api_key: string;
  instance_name: string;
  workflow_count: number;
  version: string | null;
  connection_status: 'connected' | 'disconnected';
  is_active: boolean;
  last_connected: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any[];
  created_at?: string;
  updated_at?: string;
}

export interface N8nExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  stopped_at: string;
  data: any;
  error: any;
  created_at?: string;
  updated_at?: string;
}

export class N8nService {
  private baseUrl: string = '';
  private apiKey: string = '';
  private supabase = supabase;

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async testConnection(baseUrl: string, apiKey: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Mock successful connection test
      return { 
        success: true, 
        data: { 
          version: '1.0.0', 
          workflowCount: 5 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('n8n_connections')
        .insert({
          user_id: user.id,
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: instanceName,
          workflow_count: workflowCount || 0,
          version: version || null,
          connection_status: 'connected',
          is_active: true,
          last_connected: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save connection' 
      };
    }
  }

  async deleteConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('n8n_connections')
        .delete()
        .match({ id: connectionId, user_id: user.id });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete connection' 
      };
    }
  }

  async getConnections(): Promise<N8nConnection[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as N8nConnection[];
    } catch (error) {
      console.error('Failed to get connections:', error);
      return [];
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    // Mock implementation
    return [];
  }

  async createWorkflow(workflow: any): Promise<N8nWorkflow> {
    // Mock implementation
    return workflow;
  }

  async updateWorkflow(workflow: any): Promise<N8nWorkflow> {
    // Mock implementation
    return workflow;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    // Mock implementation
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    // Mock implementation
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    // Mock implementation
  }

  async executeWorkflow(workflowId: string, data: any): Promise<N8nExecution> {
    // Mock implementation
    return {} as N8nExecution;
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    // Mock implementation
    return [];
  }

  async healthCheck(): Promise<{ status: string; message?: string }> {
    // Mock implementation
    return { status: 'ok' };
  }

  async deployWorkflow(workflow: any): Promise<any> {
    // Mock implementation
    return workflow;
  }
}

export const n8nService = new N8nService();
