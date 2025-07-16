
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (
    actionType: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ) => {
    if (!user) return;

    try {
      await supabase.from('user_analytics').insert({
        user_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  };

  const trackActivity = async (
    activityType: string,
    title: string,
    description?: string,
    metadata?: any
  ) => {
    if (!user) return;

    try {
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        activity_type: activityType,
        title,
        description,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  return {
    trackEvent,
    trackActivity
  };
};
