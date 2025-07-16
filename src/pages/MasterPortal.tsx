import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, Activity, Globe, Zap, TrendingUp, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

// Updated interfaces to match the actual database schema
interface UserAnalytics {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: any;
  created_at: string;
}

interface SystemLog {
  id: string;
  log_level: string;
  component: string;
  message: string;
  metadata: any;
  created_at: string;
}

interface ActivityFeed {
  id: string;
  user_id: string | null;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

interface N8nConnection {
  id: string;
  user_id: string;
  api_key: string;
  base_url: string;
  instance_name: string;
  connection_status: string;
  workflow_count: number | null;
  execution_count: number | null;
  is_active: boolean;
  version: string | null;
  last_connected: string | null;
  created_at: string;
  updated_at: string;
}

const MasterPortal = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<N8nConnection[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConnections: 0,
    totalWorkflows: 0,
    totalExecutions: 0,
    recentActivity: 0
  });

  useEffect(() => {
    fetchInitialData();
    setupRealtimeSubscriptions();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [usersRes, connectionsRes, analyticsRes, logsRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('n8n_connections').select('*').order('created_at', { ascending: false }),
        supabase.from('user_analytics').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (connectionsRes.data) setConnections(connectionsRes.data);
      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (logsRes.data) setSystemLogs(logsRes.data);
      if (activityRes.data) setActivityFeed(activityRes.data);

      // Calculate stats
      const totalUsers = usersRes.data?.length || 0;
      const activeConnections = connectionsRes.data?.filter((c: any) => c.connection_status === 'connected').length || 0;
      const totalWorkflows = connectionsRes.data?.reduce((sum: number, c: any) => sum + (c.workflow_count || 0), 0) || 0;
      const totalExecutions = connectionsRes.data?.reduce((sum: number, c: any) => sum + (c.execution_count || 0), 0) || 0;
      const recentActivity = analyticsRes.data?.filter((a: any) => {
        const activityDate = new Date(a.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return activityDate > yesterday;
      }).length || 0;

      setStats({
        totalUsers,
        activeConnections,
        totalWorkflows,
        totalExecutions,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to user analytics changes
    supabase
      .channel('analytics-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_analytics'
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setAnalytics(prev => [payload.new as UserAnalytics, ...prev.slice(0, 99)]);
          setStats(prev => ({ ...prev, recentActivity: prev.recentActivity + 1 }));
        }
      })
      .subscribe();

    // Subscribe to system logs changes
    supabase
      .channel('logs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_logs'
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setSystemLogs(prev => [payload.new as SystemLog, ...prev.slice(0, 49)]);
        }
      })
      .subscribe();

    // Subscribe to activity feed changes
    supabase
      .channel('activity-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activity_feed'
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setActivityFeed(prev => [payload.new as ActivityFeed, ...prev.slice(0, 49)]);
        }
      })
      .subscribe();

    // Subscribe to n8n connections changes
    supabase
      .channel('connections-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'n8n_connections'
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setConnections(prev => [payload.new as N8nConnection, ...prev]);
          setStats(prev => ({ 
            ...prev, 
            activeConnections: payload.new.connection_status === 'connected' ? prev.activeConnections + 1 : prev.activeConnections 
          }));
        } else if (payload.eventType === 'UPDATE') {
          setConnections(prev => prev.map(c => c.id === payload.new.id ? payload.new as N8nConnection : c));
        }
      })
      .subscribe();

    // Subscribe to profiles changes
    supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new as Profile, ...prev]);
          setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        }
      })
      .subscribe();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      connected: 'bg-green-500',
      disconnected: 'bg-red-500',
      error: 'bg-yellow-500'
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status}
      </Badge>
    );
  };

  const getLogLevelBadge = (level: string) => {
    const colors = {
      info: 'bg-blue-500',
      warn: 'bg-yellow-500',
      error: 'bg-red-500',
      debug: 'bg-gray-500'
    };
    return (
      <Badge className={`${colors[level as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {level}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading Master Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-600/10 border border-purple-600/20">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Master Portal</h1>
                <p className="text-muted-foreground">Real-time monitoring and analytics dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="text-xs font-mono">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>N8N Connections</CardTitle>
                <CardDescription>All user connections and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{connection.instance_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Workflows: {connection.workflow_count || 0} | Executions: {connection.execution_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(connection.connection_status)}
                        <p className="text-xs font-mono">{connection.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Real-time user actions and usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.map((analytic) => (
                    <div key={analytic.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{analytic.action_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {analytic.resource_type && analytic.resource_id && `${analytic.resource_type}: ${analytic.resource_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(analytic.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono">{analytic.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>System monitoring and error logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getLogLevelBadge(log.log_level)}
                          <span className="text-sm font-medium">{log.component}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Real-time activity across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{activity.activity_type}</Badge>
                        {activity.user_id && (
                          <p className="text-xs font-mono mt-1">{activity.user_id.slice(0, 8)}...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterPortal;
