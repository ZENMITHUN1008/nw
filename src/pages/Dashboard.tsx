
import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { useUser, useSupabaseClient } from '../hooks/useSupabase'
import { useN8n } from "../hooks/useN8n";
import { Activity, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/table"
import AIPlayground from "./AIPlayground";
import { N8nWorkflow, N8nConnection } from "../services/n8nService";
import { WorkflowGrid } from "../components/WorkflowGrid";
import { WorkflowList } from "../components/WorkflowList";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [editedWorkflowName, setEditedWorkflowName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<N8nConnection | null>(null);
  const [showAIPlayground, setShowAIPlayground] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const { 
    connections, 
    loadConnections, 
    activeConnection: activeN8nConnection, 
    workflows: n8nWorkflows, 
    loadWorkflows, 
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow
  } = useN8n();
  const { toast: showToast } = useToast();

  useEffect(() => {
    if (activeN8nConnection) {
      setActiveConnection(activeN8nConnection);
      setWorkflows(n8nWorkflows);
    } else {
      setActiveConnection(null);
      setWorkflows([]);
    }
  }, [activeN8nConnection, n8nWorkflows]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    if (activeConnection) {
      loadWorkflows();
    }
  }, [activeConnection, loadWorkflows]);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const newWorkflow = await createWorkflow({ name: newWorkflowName, nodes: [] });
      setWorkflows(prev => [...prev, newWorkflow]);
      setNewWorkflowName('');
      showToast({
        title: "Workflow Created",
        description: "Your new workflow has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating workflow:", error);
      showToast({
        title: "Error",
        description: "Failed to create workflow.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditWorkflow = (workflowId: string) => {
    const workflowToEdit = workflows.find(wf => wf.id === workflowId);
    if (workflowToEdit) {
      setEditingWorkflowId(workflowId);
      setEditedWorkflowName(workflowToEdit.name);
      setIsEditing(true);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!editingWorkflowId) return;
    setIsEditing(true);
    try {
      const updatedWorkflow = await updateWorkflow(editingWorkflowId, { name: editedWorkflowName });
      setWorkflows(prev =>
        prev.map(wf => (wf.id === editingWorkflowId ? updatedWorkflow : wf))
      );
      setEditingWorkflowId(null);
      setEditedWorkflowName('');
      showToast({
        title: "Workflow Updated",
        description: "Your workflow has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating workflow:", error);
      showToast({
        title: "Error",
        description: "Failed to update workflow.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setDeletingWorkflowId(workflowId);
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorkflowId) return;
    setIsDeleting(true);
    try {
      await deleteWorkflow(deletingWorkflowId);
      setWorkflows(prev => prev.filter(wf => wf.id !== deletingWorkflowId));
      setDeletingWorkflowId(null);
      showToast({
        title: "Workflow Deleted",
        description: "Your workflow has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      showToast({
        title: "Error",
        description: "Failed to delete workflow.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingWorkflowId(null);
    setIsDeleting(false);
  };

  const handleAction = async (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => {
    try {
      switch (action) {
        case 'activate':
          await activateWorkflow(workflowId);
          setWorkflows(prev =>
            prev.map(wf => (wf.id === workflowId ? { ...wf, active: true } : wf))
          );
          showToast({
            title: "Workflow Activated",
            description: "Your workflow has been activated.",
          });
          break;
        case 'deactivate':
          await deactivateWorkflow(workflowId);
          setWorkflows(prev =>
            prev.map(wf => (wf.id === workflowId ? { ...wf, active: false } : wf))
          );
          showToast({
            title: "Workflow Deactivated",
            description: "Your workflow has been deactivated.",
          });
          break;
        case 'delete':
          handleDeleteWorkflow(workflowId);
          break;
        case 'edit':
          handleEditWorkflow(workflowId);
          break;
        case 'view':
          // Handle view action
          break;
        default:
          console.warn(`Unhandled action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      showToast({
        title: "Error",
        description: `Failed to ${action} workflow.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">n8n Workflows</h1>

      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => setShowAIPlayground(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create with AI
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-mode">View Mode:</Label>
          <Switch 
            id="view-mode" 
            checked={viewMode === 'list'} 
            onCheckedChange={(checked: boolean) => setViewMode(checked ? 'list' : 'grid')} 
          />
        </div>
      </div>

      {activeConnection ? (
        <div className="text-green-500 mb-2">
          Connected to n8n instance: {activeConnection.base_url}
        </div>
      ) : (
        <div className="text-red-500 mb-2">
          Not connected to n8n instance
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Workflow</CardTitle>
            <CardDescription>Create a new n8n workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="My New Workflow"
                  value={newWorkflowName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateWorkflow} disabled={isCreating}>
                {isCreating ? (
                  <>
                    Creating...
                    <Activity className="w-4 h-4 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Create Workflow
                    <Plus className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Connections</CardTitle>
            <CardDescription>View and manage your n8n connections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowConnections(!showConnections)}>
              {showConnections ? "Hide Connections" : "Show Connections"}
            </Button>

            {showConnections && (
              <div className="mt-4">
                {connections.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instance Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connections.map((connection: N8nConnection) => (
                        <TableRow key={connection.id}>
                          <TableCell>
                            <div className="font-medium">{connection.instance_name}</div>
                            <div className="text-sm text-gray-600">
                              Instance: {connection.instance_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {connection.connection_status === 'connected' ? (
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-500">Connected</span>
                                <div className="text-sm text-gray-600">
                                  Connected: {connection.instance_name}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                                <span className="text-red-500">Not Connected</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-gray-500">No connections found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isEditing && editingWorkflowId && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Workflow</CardTitle>
            <CardDescription>Edit the name of the workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-workflow-name">Workflow Name</Label>
                <Input
                  id="edit-workflow-name"
                  placeholder="Updated Workflow Name"
                  value={editedWorkflowName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedWorkflowName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateWorkflow} disabled={isEditing}>
                  {isEditing ? (
                    <>
                      Updating...
                      <Activity className="w-4 h-4 ml-2 animate-spin" />
                    </>
                  ) : (
                    "Update Workflow"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isDeleting && deletingWorkflowId && (
        <Card>
          <CardHeader>
            <CardTitle>Delete Workflow</CardTitle>
            <CardDescription>Are you sure you want to delete this workflow?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    Deleting...
                    <Activity className="w-4 h-4 ml-2 animate-spin" />
                  </>
                ) : (
                  "Delete Workflow"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' ? (
        <WorkflowGrid 
          workflows={workflows} 
          onAction={handleAction}
          baseUrl={activeConnection?.base_url || ''}
        />
      ) : (
        <WorkflowList 
          workflows={workflows} 
          onAction={handleAction}
          baseUrl={activeConnection?.base_url || ''}
        />
      )}

      {showAIPlayground && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto p-4 max-w-5xl h-screen overflow-y-auto">
            <Button variant="ghost" className="absolute top-4 right-4" onClick={() => setShowAIPlayground(false)}>
              Close AI Playground
            </Button>
            <AIPlayground />
          </div>
        </div>
      )}
    </div>
  );
}
