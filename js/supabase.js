import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Keys Check:', {
  url: !!supabaseUrl,
  key: !!supabaseAnonKey
});

// Guard to prevent crash if environment variables are missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      // Mock client that doesn't crash but logs warnings
      from: () => {
        const chain = {
          select: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing (Mock)' } }),
          insert: () => chain,
          upsert: () => chain,
          delete: () => chain,
          eq: () => chain,
          order: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing (Mock)' } })
        };
        // Special case for delete().eq() or insert().select()
        // We make the chain itself a thenable or return the promise in the final step
        return chain;
      } 
    };
