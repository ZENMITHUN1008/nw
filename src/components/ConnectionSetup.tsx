
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useN8n } from "@/hooks/useN8n";

interface ConnectionSetupProps {
  onBack: () => void;
  onSkip?: () => void;
  onSuccess?: () => void;
}

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({ onBack, onSkip, onSuccess }) => {
  const [instanceName, setInstanceName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const { toast } = useToast();
  const { testConnection, saveConnection } = useN8n();

  const handleTestConnection = async () => {
    if (!instanceName || !baseUrl || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await testConnection({
        instanceName,
        baseUrl,
        apiKey,
        id: '',
        userId: '',
        isActive: true,
        connectionStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastConnected: null,
        version: null,
        workflowCount: null,
        executionCount: null
      });

      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Success",
          description: "Connection test successful!",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Error",
          description: result.error || "Connection test failed.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: error.message || "Connection test failed.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!instanceName || !baseUrl || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveConnection({
        instanceName,
        baseUrl,
        apiKey,
        id: '',
        userId: '',
        isActive: true,
        connectionStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastConnected: null,
        version: null,
        workflowCount: null,
        executionCount: null
      });

      toast({
        title: "Success",
        description: "Connection saved successfully!",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save connection.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set up n8n Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="instanceName" className="block text-sm font-medium mb-2">
              Instance Name
            </label>
            <Input
              id="instanceName"
              type="text"
              placeholder="My n8n Instance"
              value={instanceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium mb-2">
              Base URL
            </label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="https://your-n8n-instance.com"
              value={baseUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseUrl(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your n8n API key"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
            />
          </div>

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connection test failed. Please check your credentials and try again.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'success' && (
            <Alert>
              <AlertDescription>
                Connection test successful! You can now save this connection.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSaveConnection}
              disabled={connectionStatus !== 'success'}
            >
              Save Connection
            </Button>
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
              >
                Skip for now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
