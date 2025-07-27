export async function sendFormToken(email: string, formType: string) {
  try {
    const res = await fetch(`/forms/send-token/${formType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return {
      ok: false,
      data: { error: "Network error while sending form token." },
    };
  }
}

export async function revokeFormToken(email: string, formType: string) {
  try {
    const res = await fetch(`/forms/revoke-token/${formType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return {
      ok: false,
      data: { error: "Network error while revoking form token." },
    };
  }
}
