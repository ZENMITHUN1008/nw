
import { useState, useEffect, useCallback } from 'react';
import { n8nService, N8nConnection, N8nWorkflow, N8nExecution } from '../services/n8nService';

export const useN8n = () => {
  const [connections, setConnections] = useState<N8nConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<N8nConnection | null>(null);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // Set active connection when connections change
  useEffect(() => {
    const active = connections.find(conn => conn.is_active);
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

  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await n8nService.testConnection();
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
      const updatedWorkflow = await n8nService.updateWorkflow({ ...workflow, id: workflowId });
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

  const deleteWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.deleteWorkflow();
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const activateWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.activateWorkflow();
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const deactivateWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await n8nService.deactivateWorkflow();
      await loadWorkflows(); // Reload workflows
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const executeWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const execution = await n8nService.executeWorkflow();
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const executionData = await n8nService.getExecutions();
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

  const deployWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await n8nService.deployWorkflow();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
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
    deployWorkflow,

    // Execution methods
    loadExecutions,

    // Utility methods
    healthCheck,
  };
};
