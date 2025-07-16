import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Save, 
  Camera, 
  Edit3,
  
  X,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
}

interface ProfileSettings {
  email_notifications: boolean;
  workflow_notifications: boolean;
  marketing_emails: boolean;
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '',
    email: user?.email || '',
    full_name: user?.user_metadata?.full_name || '',
    avatar_url: user?.user_metadata?.avatar_url || '',
    bio: '',
    company: '',
    location: '',
    website: '',
    created_at: user?.created_at || new Date().toISOString(),
  });

  // Settings state
  const [settings, setSettings] = useState<ProfileSettings>({
    email_notifications: true,
    workflow_notifications: true,
    marketing_emails: false,
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
  });

  // Form state for editing
  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserSettings();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (data) {
        setProfile(data);
        setEditForm(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadUserSettings = async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...editForm,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setProfile(editForm);
      setIsEditing(false);
      setSaveStatus('success');
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    const name = profile.full_name || profile.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size={32} />
            <div>
              <h1 className="text-3xl font-bold text-slate-50">Profile Settings</h1>
              <p className="text-slate-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${
            saveStatus === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : saveStatus === 'error'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-indigo-500/10 border-indigo-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && <Loader className="w-5 h-5 text-indigo-500 animate-spin" />}
              {saveStatus === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              {saveStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              <p className={`font-medium ${
                saveStatus === 'success' 
                  ? 'text-emerald-400' 
                  : saveStatus === 'error'
                  ? 'text-red-400'
                  : 'text-indigo-400'
              }`}>
                {saveStatus === 'saving' && 'Saving changes...'}
                {saveStatus === 'success' && 'Changes saved successfully!'}
                {saveStatus === 'error' && 'Failed to save changes. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-50">Profile Information</h2>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditForm(profile);
                          setIsEditing(false);
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {getUserInitials()}
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors duration-200">
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-50">
                        {profile.full_name || 'No name set'}
                      </h3>
                      <p className="text-slate-400">{profile.email}</p>
                      <p className="text-sm text-slate-500">
                        Member since {formatDate(profile.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={isEditing ? editForm.full_name || '' : profile.full_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 opacity-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Company</label>
                      <input
                        type="text"
                        value={isEditing ? editForm.company || '' : profile.company || ''}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your company"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Location</label>
                      <input
                        type="text"
                        value={isEditing ? editForm.location || '' : profile.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your location"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-300">Website</label>
                      <input
                        type="url"
                        value={isEditing ? editForm.website || '' : profile.website || ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-300">Bio</label>
                      <textarea
                        value={isEditing ? editForm.bio || '' : profile.bio || ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-slate-50">Preferences</h2>

                  {/* Notifications */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-50 flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'email_notifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                        { key: 'workflow_notifications', label: 'Workflow Notifications', description: 'Get notified when workflows complete or fail' },
                        { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive product updates and tips' },
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-600/50">
                          <div>
                            <h4 className="font-medium text-slate-50">{setting.label}</h4>
                            <p className="text-sm text-slate-400">{setting.description}</p>
                          </div>
                          <button
                            onClick={() => setSettings({ ...settings, [setting.key]: !settings[setting.key as keyof ProfileSettings] })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                              settings[setting.key as keyof ProfileSettings] ? 'bg-indigo-600' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                settings[setting.key as keyof ProfileSettings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-50 flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <span>Appearance</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Theme</label>
                        <select
                          value={settings.theme}
                          onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'dark' | 'light' | 'system' })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Localization */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-50 flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>Localization</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Language</label>
                        <select
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Timezone</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>Save Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-slate-50">Security Settings</h2>

                  {/* Account Security */}
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-600/50">
                      <h3 className="text-lg font-semibold text-slate-50 mb-4">Password</h3>
                      <p className="text-slate-400 mb-4">
                        Keep your account secure by using a strong password
                      </p>
                      <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200">
                        Change Password
                      </button>
                    </div>

                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-600/50">
                      <h3 className="text-lg font-semibold text-slate-50 mb-4">Two-Factor Authentication</h3>
                      <p className="text-slate-400 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-600/50">
                      <h3 className="text-lg font-semibold text-slate-50 mb-4">Active Sessions</h3>
                      <p className="text-slate-400 mb-4">
                        Manage devices that are currently signed in to your account
                      </p>
                      <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200">
                        View Sessions
                      </button>
                    </div>

                    <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                      <p className="text-slate-400 mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all duration-200">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;