
import { useState, useEffect, useCallback } from 'react';
import { n8nService, Connection, Workflow, Execution } from '../services/n8nService';

export const useN8n = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // Set active connection when connections change
  useEffect(() => {
    const active = connections.find(conn => conn.id);
    setActiveConnection(active || null);
    
    if (active) {
      loadWorkflows();
    }
  }, [connections]);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const connections = await n8nService.getConnections();
      setConnections(connections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (baseUrl: string, apiKey: string, instanceName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await n8nService.testConnection(baseUrl, apiKey, instanceName);
      if (!response.success) {
        setError(response.error || 'Connection test failed');
        throw new Error(response.error || 'Connection test failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConnection = useCallback(async (baseUrl: string, apiKey: string, instanceName: string, workflowCount?: number, version?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await n8nService.saveConnection(baseUrl, apiKey, instanceName, workflowCount, version);
      if (response.success) {
        await loadConnections(); // Reload connections
        return response;
      } else {
        setError(response.error || 'Failed to save connection');
        throw new Error(response.error || 'Failed to save connection');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save connection';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadConnections]);

  const deleteConnection = useCallback(async (connectionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.deleteConnection(connectionId);
      await loadConnections(); // Reload connections
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete connection';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadConnections]);

  const loadWorkflows = useCallback(async () => {
    if (!activeConnection) return;
    
    try {
      setLoading(true);
      setError(null);
      const workflowData = await n8nService.getWorkflows();
      setWorkflows(workflowData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, [activeConnection]);

  const createWorkflow = useCallback(async (workflow: any) => {
    try {
      setLoading(true);
      setError(null);
      const newWorkflow = await n8nService.createWorkflow(workflow);
      await loadWorkflows(); // Reload workflows
      return newWorkflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const updateWorkflow = useCallback(async (workflowId: string, workflow: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedWorkflow = await n8nService.updateWorkflow(workflowId, workflow);
      await loadWorkflows(); // Reload workflows
      return updatedWorkflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.deleteWorkflow(workflowId);
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const activateWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.activateWorkflow(workflowId);
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const deactivateWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.deactivateWorkflow(workflowId);
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const executeWorkflow = useCallback(async (workflowId: string, data: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const execution = await n8nService.executeWorkflow(workflowId, data);
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecutions = useCallback(async (workflowId?: string, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const executionData = await n8nService.getExecutions(workflowId, limit);
      setExecutions(executionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions');
    } finally {
      setLoading(false);
    }
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      return await n8nService.healthCheck();
    } catch (err) {
      return { status: 'error', message: err instanceof Error ? err.message : 'Health check failed' };
    }
  }, []);

  return {
    // State
    connections,
    activeConnection,
    workflows,
    executions,
    loading,
    error,

    // Connection methods
    testConnection,
    saveConnection,
    deleteConnection,
    loadConnections,

    // Workflow methods
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    executeWorkflow,

    // Execution methods
    loadExecutions,

    // Utility methods
    healthCheck,
  };
};
