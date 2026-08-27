const URL = "https://ktyzbrrbukpzrcokdmpu.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0eXpicnJidWtwenJjb2tkbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODY1NTMsImV4cCI6MjA5NzM2MjU1M30.epX8oPB4KikrDwZTgO921IRWzYVEdH_-Pvxs5BBNcJE";

const fns = [
  "admin-invitations",
  "admin-invite",
  "admin-invite-accept",
  "admin-invite-resend",
  "admin-invite-revoke",
  "admin-invite-validate",
  "formateur-request-approve",
  "formateur-request-reject",
  "kyc-approve", // known-working control, for comparison
];

for (const fn of fns) {
  try {
    const res = await fetch(`${URL}/functions/v1/${fn}`, {
      method: "OPTIONS",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    console.log(`${fn}: OPTIONS status=${res.status}`);
  } catch (err) {
    console.log(`${fn}: OPTIONS threw: ${err.message}`);
  }

  try {
    const res = await fetch(`${URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    console.log(`${fn}: POST status=${res.status} body=${text.slice(0, 200)}`);
  } catch (err) {
    console.log(`${fn}: POST threw: ${err.message}`);
  }
  console.log("---");
}
