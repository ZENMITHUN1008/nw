import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Mail, Calendar, Zap, Database } from 'lucide-react';

interface UserStats {
  id: string;
  email: string;
  full_name: string | null | undefined;
  created_at: string;
  workflow_count: number;
  connection_count: number;
  last_active: string;
}

export const MasterPortal: React.FC = () => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
        id,
        email,
        full_name,
        created_at
      `);

    if (error) throw error;

    const userStats: UserStats[] = data.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      workflow_count: 0,
      connection_count: 0,
      last_active: user.created_at
    }));

      setUsers(userStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">Loading Master Portal...</h3>
          <p className="text-slate-400">Fetching user statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-50 to-orange-200 bg-clip-text text-transparent">
                Master Portal
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Add any admin controls or user-specific actions here */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-50">{user.full_name || 'N/A'}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Email: {user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Created: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Workflows: {user.workflow_count}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Connections: {user.connection_count}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Last Active: {new Date(user.last_active).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
