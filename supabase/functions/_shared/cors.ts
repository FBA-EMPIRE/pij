// Headers the Supabase SDK attaches to every request (authorization, apikey,
// x-client-info, x-retry-count) plus content-type. All must be allowed or the
// browser's CORS preflight fails and the request never reaches the function.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};
