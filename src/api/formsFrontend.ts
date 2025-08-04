import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";

export async function sendFormToken(email: string, formType: string) {
  try {
    const res = await axios.post(`/forms/send-token/${formType}`, { email });
    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      data: {
        error: getErrorDisplay(err, "Network error while sending form token."),
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
      error: getErrorDisplay(err, "Unknown error validating token"),
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
        error: getErrorDisplay(err, "Network error while revoking form token."),
      },
    };
  }
}

export async function submitBecksForm({
  token,
  result,
}: {
  token: string;
  result: string;
}) {
  try {
    const res = await axios.post("/forms/submit/becks", { token, result });
    return { ok: true, data: res.data };
  } catch (err: any) {
    const code = err?.response?.data?.code;
    const message = getErrorDisplay(
      err,
      "Network error while submitting form."
    );

    return {
      ok: false,
      error: message,
      code,
    };
  }
}

export async function submitBurnsForm({
  token,
  result,
}: {
  token: string;
  result: string;
}) {
  try {
    const res = await axios.post("/forms/submit/burns", { token, result });
    return { ok: true, data: res.data };
  } catch (err: any) {
    const code = err?.response?.data?.code;
    const message = getErrorDisplay(
      err,
      "Network error while submitting form."
    );

    return {
      ok: false,
      error: message,
      code,
    };
  }
}

export async function updateClientInfo({
  token,
  name,
  dob,
}: {
  token: string;
  name: string;
  dob: string;
}) {
  try {
    await axios.post("/forms/update-client-info", { token, name, dob });
    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      error: getErrorDisplay(err, "Unknown error updating client info"),
    };
  }
}

export async function getBecksForm(email: string) {
  try {
    const res = await axios.get(`/forms/becks/${email}`);
    return { ok: true, data: res.data };
  } catch (err: any) {
    return {
      ok: false,
      error: getErrorDisplay(err, "Failed to retrieve Becks form result."),
    };
  }
}
