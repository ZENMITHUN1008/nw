
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Settings, Plus, Zap, Activity, Clock, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useN8n } from '@/hooks/useN8n';

const Dashboard = () => {
  const { user } = useAuth();
  const { createWorkflow, updateWorkflow, workflows, loading } = useN8n();
  const [isRecording, setIsRecording] = useState(false);

  const handleCreateWorkflow = async () => {
    try {
      await createWorkflow({
        name: 'New Workflow',
        description: 'Created from dashboard',
        workflow_data: {}
      });
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleUpdateWorkflow = async (id: string) => {
    try {
      await updateWorkflow(id, {
        name: 'Updated Workflow',
        description: 'Updated from dashboard'
      });
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  const quickActions = [
    {
      title: 'Voice Command',
      description: 'Create workflows with voice',
      icon: Mic,
      action: () => setIsRecording(true),
      color: 'bg-emerald-500'
    },
    {
      title: 'New Workflow',
      description: 'Start from scratch',
      icon: Plus,
      action: handleCreateWorkflow,
      color: 'bg-blue-500'
    },
    {
      title: 'AI Playground',
      description: 'Experiment with AI',
      icon: Zap,
      action: () => {},
      color: 'bg-purple-500'
    }
  ];

  const stats = [
    { label: 'Active Workflows', value: workflows?.length || 0, icon: Activity },
    { label: 'This Month', value: '12', icon: Clock },
    { label: 'Success Rate', value: '98%', icon: Play }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user?.email}</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-indigo-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-6 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-slate-400 text-sm">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Workflows */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-400">Loading workflows...</div>
            ) : workflows && workflows.length > 0 ? (
              <div className="space-y-4">
                {workflows.slice(0, 5).map((workflow: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{workflow.name}</h4>
                      <p className="text-slate-400 text-sm">{workflow.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateWorkflow(workflow.id)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No workflows yet. Create your first one!</p>
                <Button 
                  onClick={handleCreateWorkflow}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
