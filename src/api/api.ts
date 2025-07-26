export async function fetchClientStatus(email: string) {
  const res = await fetch(
    `/clients/form-status?email=${encodeURIComponent(email)}`
  );
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function addClient(email: string) {
  const res = await fetch("/clients/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function sendFormToken(email: string, formType: string) {
  const res = await fetch(`/forms/send-token/${formType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
