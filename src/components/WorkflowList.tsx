
import React from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Play, Pause, Trash2, Edit, Eye } from 'lucide-react';

interface WorkflowListProps {
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

export const WorkflowList: React.FC<WorkflowListProps> = ({ workflows, onAction }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <TableRow key={workflow.id}>
              <TableCell className="font-medium">{workflow.name}</TableCell>
              <TableCell>
                <Badge variant={workflow.active ? "default" : "secondary"}>
                  {workflow.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {workflow.created_at ? new Date(workflow.created_at).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={workflow.active ? "outline" : "default"}
                    onClick={() => onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
                  >
                    {workflow.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onAction(workflow.id, 'edit')}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onAction(workflow.id, 'view')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onAction(workflow.id, 'delete')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
