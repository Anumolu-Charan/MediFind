import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Supabase URL and keys must be defined in environment!');
}

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SECRET_KEY || ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function testDbConnection() {
  try {
    const { data, error } = await supabase.from('medicines').select('count', { count: 'exact', head: true });
    if (error) {
      console.warn('⚠️ Supabase connection warning:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️ Supabase connection failed:', err.message);
    return false;
  }
}
