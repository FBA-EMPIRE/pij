// PostgREST/Postgres errors thrown via `if (error) throw error` are plain
// objects, not JS Error instances -- `err instanceof Error` is false for
// them, which was silently discarding the real message in favor of a
// generic "Internal server error" fallback everywhere that pattern was
// used. This extracts the real message when one is available.
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "Internal server error";
}
