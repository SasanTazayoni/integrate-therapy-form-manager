import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";

type SchemaCodes =
  | "ed"
  | "ab"
  | "ma"
  | "si"
  | "ds"
  | "fa"
  | "di"
  | "vu"
  | "eu"
  | "sb"
  | "ss"
  | "ei"
  | "us"
  | "et"
  | "is"
  | "as"
  | "np"
  | "pu";

type Scores = Partial<{
  [K in SchemaCodes as `ysq_${K}_answers`]: number[];
}>;

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

export async function sendMultipleFormTokens(email: string) {
  try {
    const res = await axios.post("/forms/send-multiple", { email });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while sending multiple form tokens."
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
  scores: Scores;
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

export async function submitSMIForm({
  token,
  results,
}: {
  token: string;
  results: Record<string, { average: number; label: string }>;
}) {
  try {
    const res = await axios.post("/forms/submit/smi", {
      token,
      results,
    });

    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const code = err?.response?.data?.code;
      const message = getErrorDisplay(
        err,
        "Network error while submitting SMI form."
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

export type SmiForm = {
  id: string;
  submittedAt: string;
  smiScores: Record<string, string | null>;
};

export type FetchAllSmiFormsResult = {
  ok: boolean;
  data: {
    clientName?: string | null;
    smiForms?: SmiForm[];
    error?: string;
  };
};

export async function fetchAllSmiForms(
  email: string
): Promise<FetchAllSmiFormsResult> {
  try {
    const res = await axios.get<{
      clientName: string | null;
      smiForms: SmiForm[];
    }>("/forms/smi/all", { params: { email } });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while fetching SMI forms."
          ),
        },
      };
    }
    return {
      ok: false,
      data: { error: "An unexpected error occurred while fetching SMI forms." },
    };
  }
}
