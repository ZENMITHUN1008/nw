import React from 'react';
import { Activity, Calendar, Play, Pause, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { N8nWorkflow } from "../services/n8nService";

interface WorkflowGridProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: "activate" | "deactivate" | "delete" | "edit" | "view") => Promise<void>;
  baseUrl: string;
}

const WorkflowGrid: React.FC<WorkflowGridProps> = ({ workflows, onAction, baseUrl }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflows.map(workflow => (
        <Card key={workflow.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              {workflow.name}
              <Badge variant={workflow.active ? "default" : "secondary"}>
                {workflow.active ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Created: {new Date(workflow.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {workflow.nodes?.length} Nodes
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => onAction(workflow.id, 'view')}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onAction(workflow.id, 'edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {workflow.active ? (
                <Button variant="outline" size="sm" onClick={() => onAction(workflow.id, 'deactivate')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              ) : (
                <Button size="sm" onClick={() => onAction(workflow.id, 'activate')}>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => onAction(workflow.id, 'delete')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkflowGrid;
