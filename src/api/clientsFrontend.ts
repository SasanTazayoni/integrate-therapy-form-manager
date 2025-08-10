import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";

export async function fetchClientStatus(email: string) {
  try {
    const res = await axios.get("/clients/form-status", {
      params: { email },
    });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while fetching client status."
          ),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "An unexpected error occurred while fetching client status.",
      },
    };
  }
}

export async function addClient(email: string) {
  try {
    const res = await axios.post("/clients/add", { email });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(err, "Network error while adding client."),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "An unexpected error occurred while adding client.",
      },
    };
  }
}
