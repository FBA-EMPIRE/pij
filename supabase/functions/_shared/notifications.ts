// deno-lint-ignore no-explicit-any
type AnyClient = any;

export async function createNotification(
  supabase: AnyClient,
  entry: { userId: string; type: string; title: string; message: string },
) {
  await supabase.from("notifications").insert({
    user_id: entry.userId,
    type: entry.type,
    title: entry.title,
    message: entry.message,
  });
}
