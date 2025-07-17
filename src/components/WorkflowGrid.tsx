
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Play, 
  Pause, 
  MoreVertical, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface WorkflowGridProps {
  workflows: any[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl: string;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({ workflows, onAction, baseUrl }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow: any) => (
        <Card key={workflow.id}>
          <CardHeader>
            <CardTitle>{workflow.name}</CardTitle>
            <CardDescription>
              <Badge variant={workflow.active ? "default" : "secondary"}>
                {workflow.active ? "Active" : "Inactive"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-500">
              Created: {new Date(workflow.createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`${baseUrl}/workflow/${workflow.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in n8n
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onAction(workflow.id, 'view')}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction(workflow.id, 'edit')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {workflow.active ? (
                    <DropdownMenuItem onClick={() => onAction(workflow.id, 'deactivate')}>
                      <Pause className="w-4 h-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onAction(workflow.id, 'activate')}>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onAction(workflow.id, 'delete')}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
