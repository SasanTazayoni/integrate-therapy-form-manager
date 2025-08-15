import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";
import type { ClientFormsStatus } from "../types/formStatusTypes";

type FetchClientStatusResult =
  | { ok: true; data: ClientFormsStatus }
  | { ok: false; data: { error: string } };

type AddClientResult =
  | { ok: true; data: ClientFormsStatus }
  | { ok: false; data: { error: string } };

export async function fetchClientStatus(
  email: string
): Promise<FetchClientStatusResult> {
  try {
    const res = await axios.get<ClientFormsStatus>("/clients/form-status", {
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

export async function addClient(email: string): Promise<AddClientResult> {
  try {
    const res = await axios.post<ClientFormsStatus>("/clients/add", { email });
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
