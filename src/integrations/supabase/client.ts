
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kqemyueobhimorhdxodh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZW15dWVvYmhpbW9yaGR4b2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDU5MjEsImV4cCI6MjA2ODIyMTkyMX0.maTYK02fvFR-qfqqQaI0O_LxCJ8tHZ1MBLvZkJcqfhk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Ensure proper module exports
export default supabase;
