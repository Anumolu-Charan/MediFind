import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://ykqcngvddqracfhpyhyt.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcWNuZ3ZkZHFyYWNmaHB5aHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjg3NTQsImV4cCI6MjEwNjg0NDc1NH0.Od51_3znaskyGk8CmjNS0k5d8FTJFMVDDOuEVn3fG_A',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'medifind_super_secret_jwt_key_2026_production_grade_token!',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
};
