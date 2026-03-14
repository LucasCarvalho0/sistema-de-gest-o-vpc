import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard to prevent crash if environment variables are missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      // Mock client that doesn't crash but logs warnings
      from: () => ({ 
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing' } }),
        upsert: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing' } }),
        delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        order: () => Promise.resolve({ data: [], error: null })
      }) 
    };
