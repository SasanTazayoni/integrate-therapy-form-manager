import axios from "axios";

export async function sendFormToken(email: string, formType: string) {
  try {
    const res = await axios.post(`/forms/send-token/${formType}`, { email });
    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      data: {
        error:
          err.response?.data?.error ||
          "Network error while sending form token.",
      },
    };
  }
}

export async function validateFormToken(token: string) {
  try {
    const res = await axios.get("/forms/validate-token", {
      params: { token },
    });

    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      error:
        err.response?.data?.message ||
        err.message ||
        "Unknown error validating token",
    };
  }
}

export async function revokeFormToken(email: string, formType: string) {
  try {
    const res = await axios.post(`/forms/revoke-token/${formType}`, { email });
    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      data: {
        error:
          err.response?.data?.error ||
          "Network error while revoking form token.",
      },
    };
  }
}
