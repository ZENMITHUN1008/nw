import React from 'react';
import { Activity, Calendar, Play, Pause, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { N8nWorkflow } from "../services/n8nService";

interface WorkflowListProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => Promise<void>;
  baseUrl: string;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ workflows, onAction, baseUrl }) => {
  return (
    <div className="grid gap-4">
      {workflows.map((workflow) => (
        <Card key={workflow.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {workflow.name}
              <div>
                {workflow.active ? (
                  <Badge variant="default">
                    <Activity className="mr-2 h-4 w-4" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Pause className="mr-2 h-4 w-4" />
                    Inactive
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              <div className="flex items-center text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                Created: {new Date(workflow.createdAt).toLocaleDateString()}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onAction(workflow.id, 'view')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction(workflow.id, 'edit')}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {workflow.active ? (
                  <Button variant="ghost" size="sm" onClick={() => onAction(workflow.id, 'deactivate')}>
                    <Pause className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAction(workflow.id, 'activate')}>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
              </div>
              <div>
                <Button variant="destructive" size="sm" onClick={() => onAction(workflow.id, 'delete')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
