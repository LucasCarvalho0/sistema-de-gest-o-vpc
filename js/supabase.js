import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivcsftaiwotazxvxxrxo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y3NmdGFpd290YXp4dnh4cnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzMxMjAsImV4cCI6MjA4OTA0OTEyMH0.eMzdyQRbittFxfXptZ-OlVbNimmsFDcjG0W6TaM-R9s'

console.log('Supabase Keys Check:', {
  url: !!supabaseUrl,
  key: !!supabaseAnonKey,
  mode: (import.meta.env.VITE_SUPABASE_URL) ? 'env' : 'fallback'
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
