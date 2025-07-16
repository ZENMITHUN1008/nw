import type { Database } from "../integrations/supabase/types";
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
        .eq('user_id', user.id)

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
        .eq('user_id', user.id)

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
}

export const n8nService = new N8nService();
