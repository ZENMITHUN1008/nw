import { useState, useEffect } from 'react';
import { authService } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await authService.getSession();
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false,
      });
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    await authService.signOut();
  };

  return {
    ...authState,
    signOut,
  };
};