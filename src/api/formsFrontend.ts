import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";

export async function sendFormToken(email: string, formType: string) {
  try {
    const res = await axios.post(`/forms/send-token/${formType}`, { email });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while sending form token."
          ),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "Unexpected error occurred.",
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
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        error: getErrorDisplay(err, "Unknown error validating token"),
      };
    }
    return {
      ok: false,
      error: "Unexpected error occurred.",
    };
  }
}

export async function revokeFormToken(email: string, formType: string) {
  try {
    const res = await axios.post(`/forms/revoke-token/${formType}`, { email });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while revoking form token."
          ),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "Unexpected error occurred.",
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
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
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
    return {
      ok: false,
      error: "Unexpected error occurred.",
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
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
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
    return {
      ok: false,
      error: "Unexpected error occurred.",
    };
  }
}

export async function submitYSQForm({
  token,
  scores,
}: {
  token: string;
  scores: {
    ysq_ed_answers?: number[];
    ysq_ab_answers?: number[];
  };
}) {
  try {
    const res = await axios.post("/forms/submit/ysq", {
      token,
      scores,
    });

    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const code = err?.response?.data?.code;
      const message = getErrorDisplay(
        err,
        "Network error while submitting YSQ form."
      );

      return { ok: false, error: message, code };
    }
    return { ok: false, error: "Unexpected error occurred." };
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
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        error: getErrorDisplay(err, "Unknown error updating client info"),
      };
    }
    return {
      ok: false,
      error: "Unexpected error occurred.",
    };
  }
}

export async function getBecksForm(email: string) {
  try {
    const res = await axios.get(`/forms/becks/${email}`);
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        error: getErrorDisplay(err, "Failed to retrieve Becks form result."),
      };
    }
    return {
      ok: false,
      error: "Unexpected error occurred.",
    };
  }
}
