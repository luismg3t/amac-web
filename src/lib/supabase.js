import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !llave) {
  throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env.local')
}

export const supabase = createClient(url, llave)
