
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useN8n } from "@/hooks/useN8n";

interface Credential {
  nodeType: string;
  nodeName: string;
  credentialType: string;
  required: boolean;
  description: string;
  placeholder: string;
  value?: string;
}

interface WorkflowCredentialsManagerProps {
  workflow: any;
  onCredentialsComplete: (updatedWorkflow: any) => void;
}

export const WorkflowCredentialsManager: React.FC<WorkflowCredentialsManagerProps> = ({
  workflow,
  onCredentialsComplete
}) => {
  const { deployWorkflow } = useN8n();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'pending' | 'success' | 'error'>('pending');

  React.useEffect(() => {
    if (workflow) {
      extractRequiredCredentials();
    }
  }, [workflow]);

  const extractRequiredCredentials = () => {
    const requiredCreds: Credential[] = [];
    
    workflow.nodes?.forEach((node: any) => {
      const nodeType = node.type;
      const nodeName = node.name;
      
      // Define credential requirements for different node types
      const credentialMap: Record<string, Credential[]> = {
        'n8n-nodes-base.googleSheets': [{
          nodeType,
          nodeName,
          credentialType: 'googleSheetsOAuth2Api',
          required: true,
          description: 'Google Sheets OAuth2 credentials',
          placeholder: 'Enter your Google OAuth2 credentials'
        }],
        'n8n-nodes-base.youtube': [{
          nodeType,
          nodeName,
          credentialType: 'youTubeOAuth2Api',
          required: true,
          description: 'YouTube Data API OAuth2 credentials',
          placeholder: 'Enter your YouTube OAuth2 credentials'
        }],
        'n8n-nodes-base.telegram': [{
          nodeType,
          nodeName,
          credentialType: 'telegramApi',
          required: true,
          description: 'Telegram Bot Token',
          placeholder: 'Enter your Telegram Bot Token'
        }],
        'n8n-nodes-base.slack': [{
          nodeType,
          nodeName,
          credentialType: 'slackOAuth2Api',
          required: true,
          description: 'Slack OAuth2 credentials',
          placeholder: 'Enter your Slack OAuth2 credentials'
        }],
        'n8n-nodes-base.gmail': [{
          nodeType,
          nodeName,
          credentialType: 'gmailOAuth2',
          required: true,
          description: 'Gmail OAuth2 credentials',
          placeholder: 'Enter your Gmail OAuth2 credentials'
        }],
        'n8n-nodes-base.httpRequest': [{
          nodeType,
          nodeName,
          credentialType: 'httpBasicAuth',
          required: false,
          description: 'HTTP Basic Authentication (if required)',
          placeholder: 'Enter username:password if needed'
        }]
      };

      const nodeCredentials = credentialMap[nodeType];
      if (nodeCredentials) {
        requiredCreds.push(...nodeCredentials);
      }
    });

    setCredentials(requiredCreds);
  };

  const updateCredentialValue = (index: number, value: string) => {
    const updatedCredentials = [...credentials];
    updatedCredentials[index].value = value;
    setCredentials(updatedCredentials);
  };

  const applyCredentialsToWorkflow = () => {
    const updatedWorkflow = { ...workflow };
    
    updatedWorkflow.nodes = updatedWorkflow.nodes.map((node: any) => {
      const nodeCredentials = credentials.filter(cred => cred.nodeName === node.name);
      
      if (nodeCredentials.length > 0) {
        const updatedNode = { ...node };
        updatedNode.credentials = {};
        
        nodeCredentials.forEach(cred => {
          if (cred.value) {
            updatedNode.credentials[cred.credentialType] = {
              id: `cred_${Date.now()}_${Math.random()}`,
              name: `${cred.credentialType}_${node.name}`
            };
          }
        });
        
        return updatedNode;
      }
      
      return node;
    });

    return updatedWorkflow;
  };

  const handleDeployWorkflow = async () => {
    setIsDeploying(true);
    try {
      const updatedWorkflow = applyCredentialsToWorkflow();
      await deployWorkflow(updatedWorkflow);
      setDeploymentStatus('success');
      onCredentialsComplete(updatedWorkflow);
    } catch (error) {
      console.error('Error deploying workflow:', error);
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const allRequiredCredentialsProvided = credentials
    .filter(cred => cred.required)
    .every(cred => cred.value && cred.value.trim() !== '');

  if (!workflow || credentials.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Workflow Credentials Required
        </CardTitle>
        <CardDescription>
          This workflow requires the following credentials to function properly. 
          Please provide the necessary API keys and tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Credential Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((cred, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{cred.nodeName}</TableCell>
                  <TableCell>{cred.description}</TableCell>
                  <TableCell>
                    <Badge variant={cred.required ? "destructive" : "secondary"}>
                      {cred.required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type={cred.credentialType.includes('token') ? 'password' : 'text'}
                      placeholder={cred.placeholder}
                      value={cred.value || ''}
                      onChange={(e) => updateCredentialValue(index, e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    {cred.value && cred.value.trim() !== '' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : cred.required ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {deploymentStatus === 'success' && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Workflow deployed successfully!
                </span>
              )}
              {deploymentStatus === 'error' && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Deployment failed. Please check your credentials.
                </span>
              )}
            </div>
            <Button
              onClick={handleDeployWorkflow}
              disabled={!allRequiredCredentialsProvided || isDeploying}
              className="flex items-center gap-2"
            >
              {isDeploying ? (
                'Deploying...'
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Deploy to n8n
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
