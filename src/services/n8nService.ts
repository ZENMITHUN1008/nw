// Removed unused Database import
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
  async saveWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_workflows')
        .insert({
          ...workflow,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving workflow:', error);
        return null;
      }

      return data as N8nWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      return null;
    }
  }

  async updateWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_workflows')
        .update({
          ...workflow,
          user_id: user.id,
        })
        .eq('id', workflow.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workflow:', error);
        return null;
      }

      return data as N8nWorkflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      return null;
    }
  }

  async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching workflow:', error);
        return null;
      }

      return data as N8nWorkflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching workflows:', error);
        return [];
      }

      return data as N8nWorkflow[];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('n8n_workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting workflow:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  async saveInstance(instance: N8nInstance): Promise<N8nInstance | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_instances')
        .insert({
          ...instance,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving instance:', error);
        return null;
      }

      return data as N8nInstance;
    } catch (error) {
      console.error('Error saving instance:', error);
      return null;
    }
  }

  async updateInstance(instance: N8nInstance): Promise<N8nInstance | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_instances')
        .update({
          ...instance,
          user_id: user.id,
        })
        .eq('id', instance.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating instance:', error);
        return null;
      }

      return data as N8nInstance;
    } catch (error) {
      console.error('Error updating instance:', error);
      return null;
    }
  }

  async getInstance(id: string): Promise<N8nInstance | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('n8n_instances')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching instance:', error);
        return null;
      }

      return data as N8nInstance;
    } catch (error) {
      console.error('Error fetching instance:', error);
      return null;
    }
  }

  async getInstances(): Promise<N8nInstance[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('n8n_instances')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching instances:', error);
        return [];
      }

      return data as N8nInstance[];
    } catch (error) {
      console.error('Error fetching instances:', error);
      return [];
    }
  }

  async deleteInstance(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('n8n_instances')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting instance:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting instance:', error);
      return false;
    }
  }

  // Connection Management Methods
  async getConnections(): Promise<N8nConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        name: conn.instance_name,
        baseUrl: conn.base_url,
        apiKey: conn.api_key,
        isActive: conn.is_active,
        status: conn.connection_status,
        version: conn.version,
        workflowCount: conn.workflow_count,
        executionCount: conn.execution_count,
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
      // Simple connection test - just verify the URL format and return mock data
      if (!baseUrl.startsWith('http')) {
        throw new Error('Invalid URL format');
      }
      return { success: true, version: '1.0.0' };
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  async saveConnection(baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('n8n_connections')
        .insert({
          base_url: baseUrl,
          api_key: apiKey,
          instance_name: instanceName,
          workflow_count: workflowCount || 0,
          version: version || '1.0.0',
          user_id: user.id,
          connection_status: 'connected'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('n8n_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }

  async createWorkflow(workflow: any): Promise<any> {
    return this.saveWorkflow(workflow);
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock activation - in real implementation this would call n8n API
      console.log('Activating workflow:', workflowId);
    } catch (error) {
      console.error('Error activating workflow:', error);
      throw error;
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock deactivation - in real implementation this would call n8n API
      console.log('Deactivating workflow:', workflowId);
    } catch (error) {
      console.error('Error deactivating workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock execution - in real implementation this would call n8n API
      console.log('Executing workflow:', workflowId, data);
      return { success: true, executionId: `exec_${Date.now()}` };
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    try {
      // Mock executions - in real implementation this would call n8n API
      return [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  }

  async healthCheck(): Promise<any> {
    try {
      // Mock health check - in real implementation this would call n8n API
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  }
}

export const n8nService = new N8nService();
