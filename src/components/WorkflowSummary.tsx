
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workflow, Zap, ArrowRight, Settings } from "lucide-react";

interface WorkflowSummaryProps {
  workflow: any;
  explanation: string;
}

export const WorkflowSummary: React.FC<WorkflowSummaryProps> = ({
  workflow,
  explanation
}) => {
  if (!workflow) return null;

  const nodeCount = workflow.nodes?.length || 0;
  const connectionCount = Object.keys(workflow.connections || {}).length;
  
  const getNodeTypeIcon = (nodeType: string) => {
    if (nodeType.includes('googleSheets')) return '📊';
    if (nodeType.includes('youtube')) return '📺';
    if (nodeType.includes('telegram')) return '💬';
    if (nodeType.includes('slack')) return '💼';
    if (nodeType.includes('gmail')) return '📧';
    if (nodeType.includes('webhook')) return '🔗';
    if (nodeType.includes('http')) return '🌐';
    if (nodeType.includes('function')) return '⚡';
    if (nodeType.includes('cron')) return '⏰';
    return '⚙️';
  };

  const getServiceName = (nodeType: string) => {
    const typeMap: Record<string, string> = {
      'n8n-nodes-base.googleSheets': 'Google Sheets',
      'n8n-nodes-base.youtube': 'YouTube',
      'n8n-nodes-base.telegram': 'Telegram',
      'n8n-nodes-base.slack': 'Slack',
      'n8n-nodes-base.gmail': 'Gmail',
      'n8n-nodes-base.webhook': 'Webhook',
      'n8n-nodes-base.httpRequest': 'HTTP Request',
      'n8n-nodes-base.function': 'Function',
      'n8n-nodes-base.cron': 'Cron Trigger'
    };
    return typeMap[nodeType] || nodeType.replace('n8n-nodes-base.', '');
  };

  return (
    <Card className="mt-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Workflow className="h-5 w-5" />
          Workflow Created Successfully!
        </CardTitle>
        <CardDescription className="text-green-700">
          {workflow.name || 'AI Generated Workflow'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{nodeCount}</div>
            <div className="text-sm text-gray-600">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{connectionCount}</div>
            <div className="text-sm text-gray-600">Connections</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflow Components:
          </h4>
          <div className="space-y-2">
            {workflow.nodes?.map((node: any, index: number) => (
              <div key={node.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                <span className="text-lg">{getNodeTypeIcon(node.type)}</span>
                <span className="font-medium">{node.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {getServiceName(node.type)}
                </Badge>
                {index < nodeCount - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {explanation && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              How it works:
            </h4>
            <div className="bg-white p-3 rounded border text-sm text-gray-700">
              {explanation}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
