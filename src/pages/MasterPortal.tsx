
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Activity, Database, BarChart3, Clock, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import Logo from '../components/Logo';

interface UserStats {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
  workflow_count: number;
  connection_count: number;
  last_active?: string;
}

interface SystemStats {
  total_users: number;
  total_workflows: number;
  total_connections: number;
  active_connections: number;
}

export const MasterPortal: React.FC = () => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 0,
    total_workflows: 0,
    total_connections: 0,
    active_connections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const usersChannel = supabase
      .channel('master-portal-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_connections' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get all users with their profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get connection counts for each user
      const { data: connections, error: connectionsError } = await supabase
        .from('n8n_connections')
        .select('user_id, id, is_active');

      if (connectionsError) throw connectionsError;

      // Calculate stats per user
      const userStats: UserStats[] = profiles?.map(profile => {
        const userConnections = connections?.filter(conn => conn.user_id === profile.id) || [];
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          workflow_count: 0, // We'll update this when we have workflow data
          connection_count: userConnections.length,
          last_active: profile.updated_at
        };
      }) || [];

      setUsers(userStats);

      // Calculate system stats
      const activeConnections = connections?.filter(conn => conn.is_active)?.length || 0;
      setSystemStats({
        total_users: profiles?.length || 0,
        total_workflows: 0, // Will be updated when we have workflow data
        total_connections: connections?.length || 0,
        active_connections: activeConnections
      });

    } catch (error) {
      console.error('Error loading master portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">Loading Master Portal...</h3>
          <p className="text-slate-400">Gathering system analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Logo size={32} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
                  Master Portal
                </h1>
                <p className="text-xs text-slate-400">System Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Live Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-slate-50">{systemStats.total_users}</p>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Connections</p>
                <p className="text-3xl font-bold text-slate-50">{systemStats.total_connections}</p>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">{systemStats.active_connections} active</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Workflows</p>
                <p className="text-3xl font-bold text-slate-50">{systemStats.total_workflows}</p>
                <div className="flex items-center space-x-2 text-amber-400">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Deployed</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold text-emerald-400">98%</p>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Operational</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/40">
            <h2 className="text-xl font-bold text-slate-50 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </h2>
            <p className="text-slate-400 mt-1">Real-time user activity and usage analytics</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Connections
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Workflows
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user.full_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-50">
                            {user.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-slate-400">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.connection_count > 0 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.connection_count} connections
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user.workflow_count} workflows
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {user.last_active ? formatDate(user.last_active) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No Users Found</h3>
              <p className="text-slate-500">No users have registered yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
