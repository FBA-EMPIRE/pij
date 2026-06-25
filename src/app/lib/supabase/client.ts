import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ktyzbrrbukpzrcokdmpu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qfdelJMXrWN0yFbsW74xhA_RGaME9OL";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
