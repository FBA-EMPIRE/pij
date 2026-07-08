const SERVICE_ID = "service_8arl6sl";
const TEMPLATE_ID = "template_itaasnt";
const PUBLIC_KEY = "u7i5Tv7x73PMTnk83";

export async function sendVerificationEmail(
  toEmail: string,
  verifCode: string,
  expiresAt: Date,
): Promise<{ sent: boolean; error?: string }> {
  if (!verifCode) {
    return { sent: false, error: "Code manquant — redéployez la fonction send-verification-code" };
  }

  // Use manual formatting — toLocaleTimeString("fr-FR") returns "Invalid time"
  // on an Invalid Date in some browsers, which gets sent verbatim to the template.
  const expiry = isNaN(expiresAt.getTime())
    ? new Date(Date.now() + 30 * 60 * 1000)
    : expiresAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  const timeStr = `${pad(expiry.getHours())}h${pad(expiry.getMinutes())}`;

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_email: toEmail,
          verif_code: verifCode,
          time: timeStr,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { sent: false, error: text };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
