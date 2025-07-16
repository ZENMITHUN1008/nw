import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  MapPin,
  Globe,
  FileText,
  Save,
  Camera,
  Shield,
  Bell,
  Palette,
  Languages,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "../integrations/supabase/client";

interface ProfilePageProps {
  onBack: () => void;
}

interface ProfileData {
  full_name: string;
  bio: string;
  company: string;
  location: string;
  website: string;
  avatar_url: string;
}

interface UserSettings {
  email_notifications: boolean;
  workflow_notifications: boolean;
  marketing_emails: boolean;
  theme: string;
  language: string;
  timezone: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    avatar_url: '',
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email_notifications: true,
    workflow_notifications: true,
    marketing_emails: false,
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          company: profile.company || '',
          location: profile.location || '',
          website: profile.website || '',
          avatar_url: profile.avatar_url || '',
        });
      }

      if (settings) {
        setUserSettings({
          email_notifications: settings.email_notifications,
          workflow_notifications: settings.workflow_notifications,
          marketing_emails: settings.marketing_emails,
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          ...profileData,
        });

      if (profileError) throw profileError;

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...userSettings,
        });

      if (settingsError) throw settingsError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Your Profile</h1>
                  <p className="text-sm text-slate-400">Manage your personal information and settings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Personal Information</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-400 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 cursor-not-allowed"
                  placeholder="Your Email Address"
                  disabled
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none h-24"
                  placeholder="A brief description about yourself"
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="url"
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="URL to your avatar image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Professional Information</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Your Company"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Your Location"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Your Website"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Settings</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Email Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings.email_notifications}
                  onChange={(e) => setUserSettings({ ...userSettings, email_notifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                <Shield className="absolute left-1 top-1 w-4 h-4 text-slate-400" />
              </label>
            </div>

            {/* Workflow Notifications */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Workflow Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings.workflow_notifications}
                  onChange={(e) => setUserSettings({ ...userSettings, workflow_notifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                <Bell className="absolute left-1 top-1 w-4 h-4 text-slate-400" />
              </label>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Marketing Emails</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings.marketing_emails}
                  onChange={(e) => setUserSettings({ ...userSettings, marketing_emails: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                <Mail className="absolute left-1 top-1 w-4 h-4 text-slate-400" />
              </label>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={userSettings.theme}
                  onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={userSettings.language}
                  onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={userSettings.timezone}
                  onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/Los_Angeles">Los Angeles</option>
                  <option value="America/New_York">New York</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
