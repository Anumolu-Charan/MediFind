import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ykqcngvddqracfhpyhyt.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcWNuZ3ZkZHFyYWNmaHB5aHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjg3NTQsImV4cCI6MjEwNjg0NDc1NH0.Od51_3znaskyGk8CmjNS0k5d8FTJFMVDDOuEVn3fG_A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
