
-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  company text,
  location text,
  website text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications boolean DEFAULT true NOT NULL,
  workflow_notifications boolean DEFAULT true NOT NULL,
  marketing_emails boolean DEFAULT false NOT NULL,
  theme text DEFAULT 'dark' NOT NULL,
  language text DEFAULT 'en' NOT NULL,
  timezone text DEFAULT 'UTC' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create n8n_connections table
CREATE TABLE IF NOT EXISTS public.n8n_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instance_name text NOT NULL,
  base_url text NOT NULL,
  api_key text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  last_connected timestamptz,
  connection_status text DEFAULT 'disconnected' NOT NULL,
  version text,
  workflow_count integer DEFAULT 0,
  execution_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_connection_status CHECK (connection_status IN ('connected', 'disconnected', 'error'))
);

-- Create mcp_servers table
CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  authorization_token text,
  tool_configuration jsonb DEFAULT '{"enabled": true}'::jsonb,
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  tools jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create conversation_memory table
CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  context jsonb NOT NULL DEFAULT '{
    "active_workflows": [],
    "user_preferences": {},
    "recent_actions": []
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for n8n_connections
CREATE POLICY "Users can view their own n8n connections"
  ON public.n8n_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own n8n connections"
  ON public.n8n_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own n8n connections"
  ON public.n8n_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own n8n connections"
  ON public.n8n_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for mcp_servers
CREATE POLICY "Users can view their own MCP servers"
  ON public.mcp_servers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCP servers"
  ON public.mcp_servers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCP servers"
  ON public.mcp_servers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCP servers"
  ON public.mcp_servers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for conversation_memory
CREATE POLICY "Users can only access their own conversation memory"
  ON public.conversation_memory FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_n8n_connections_user_id ON public.n8n_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_connections_active ON public.n8n_connections(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mcp_servers_user_id ON public.mcp_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_status ON public.mcp_servers(status);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_session ON public.conversation_memory(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_updated_at ON public.conversation_memory(updated_at DESC);

-- Create triggers for automatic profile and settings creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_conversation_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
DROP TRIGGER IF EXISTS handle_mcp_servers_updated_at ON public.mcp_servers;
DROP TRIGGER IF EXISTS update_conversation_memory_updated_at_trigger ON public.conversation_memory;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();

CREATE TRIGGER handle_mcp_servers_updated_at
  BEFORE UPDATE ON public.mcp_servers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_conversation_memory_updated_at_trigger
  BEFORE UPDATE ON public.conversation_memory
  FOR EACH ROW EXECUTE FUNCTION update_conversation_memory_updated_at();
