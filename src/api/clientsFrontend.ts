export async function fetchClientStatus(email: string) {
  try {
    const res = await fetch(
      `/clients/form-status?email=${encodeURIComponent(email)}`
    );
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return {
      ok: false,
      data: { error: "Network error while fetching client status." },
    };
  }
}

export async function addClient(email: string) {
  try {
    const res = await fetch("/clients/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, data: { error: "Network error while adding client." } };
  }
}
