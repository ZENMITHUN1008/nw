
-- Create table for tracking user analytics and usage
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create table for system monitoring logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level text NOT NULL DEFAULT 'info',
  component text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create table for real-time activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Create policies for master portal access (public read for analytics)
CREATE POLICY "Allow public read access to user_analytics" 
  ON public.user_analytics 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert user_analytics" 
  ON public.user_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to system_logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow service role to insert system_logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to activity_feed" 
  ON public.activity_feed 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert activity_feed" 
  ON public.activity_feed 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;

-- Set replica identity for realtime updates
ALTER TABLE public.user_analytics REPLICA IDENTITY FULL;
ALTER TABLE public.system_logs REPLICA IDENTITY FULL;
ALTER TABLE public.activity_feed REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_created_at ON public.user_analytics(created_at DESC);
CREATE INDEX idx_system_logs_component ON public.system_logs(component);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
