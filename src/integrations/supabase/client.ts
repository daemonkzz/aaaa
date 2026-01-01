import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbuatycybtwblwyychag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidWF0eWN5YnR3Ymx3eXljaGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjU3NTAsImV4cCI6MjA4MjEwMTc1MH0.s8NCLwXHgV86H4rULgjoXPHtywqALzkWi1nehvr0pO0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
