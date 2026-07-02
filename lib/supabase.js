import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Nombre del "bucket" (carpeta contenedora) donde se guardan todos los archivos.
// Debes crear un bucket con este mismo nombre en tu panel de Supabase.
export const BUCKET_NAME = "archivos";
