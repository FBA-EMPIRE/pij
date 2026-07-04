export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("EMAIL_FROM") || "PIJ <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not configured — email to ${to} was not sent`);
    return { sent: false, error: "Email provider not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress, to: [to], subject, html }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[email] Resend API error ${res.status}:`, text);
      return { sent: false, error: `Email provider returned ${res.status}` };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email delivery error";
    console.error("[email] Failed to send:", message);
    return { sent: false, error: message };
  }
}

export function adminInviteEmailHtml(opts: { activationUrl: string; role: string; expiresAt: string }) {
  const roleLabel = opts.role === "super_admin" ? "Super Admin" : "Admin";
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E2530;">Welcome to PIJ Administration</h2>
      <p style="color: #4B5563; font-size: 14px;">
        You've been invited to join the PIJ administration team as <strong>${roleLabel}</strong>.
      </p>
      <p style="margin: 24px 0;">
        <a href="${opts.activationUrl}" style="background: #4CAF68; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
          Activate your account
        </a>
      </p>
      <p style="color: #9CA3AF; font-size: 12px;">
        This invitation expires on ${new Date(opts.expiresAt).toLocaleString()}. If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
}
