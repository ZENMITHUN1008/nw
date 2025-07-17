
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Activity, Play, Pause, Trash2, Edit, Eye } from 'lucide-react';

interface WorkflowGridProps {
  workflows: Array<{
    id: string;
    name: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
  }>;
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl: string;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({ workflows, onAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <Badge variant={workflow.active ? "default" : "secondary"}>
                {workflow.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription>
              Created: {workflow.created_at ? new Date(workflow.created_at).toLocaleDateString() : 'Unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={workflow.active ? "outline" : "default"}
                onClick={() => onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
              >
                {workflow.active ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {workflow.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction(workflow.id, 'edit')}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction(workflow.id, 'view')}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onAction(workflow.id, 'delete')}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
