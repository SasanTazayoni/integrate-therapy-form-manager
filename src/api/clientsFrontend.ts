import axios from "axios";
import { getErrorDisplay } from "../utils/getErrorDisplay";
import type { ClientFormsStatus } from "../types/formStatusTypes";

export type Client = {
  id: string;
  name: string;
  email: string;
};

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

type DeleteClientResult =
  | { ok: true; data: { message: string } }
  | { ok: false; data: { error: string } };

export async function deleteClient(email: string): Promise<DeleteClientResult> {
  try {
    const res = await axios.delete<{ message: string }>(`/clients/by-email`, {
      params: { email },
    });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(err, "Network error while deleting client."),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "An unexpected error occurred while deleting client.",
      },
    };
  }
}

export async function deleteClientByEmail(
  email: string
): Promise<DeleteClientResult> {
  return await deleteClient(email);
}

type DeactivateClientResponse = {
  message: string;
  client: {
    id: string;
    email: string;
    name: string;
    status: string;
    inactivated_at: string | null;
    delete_inactive: string | null;
  };
};

type DeactivateClientResult =
  | { ok: true; data: DeactivateClientResponse }
  | { ok: false; data: { error: string } };

export async function deactivateClient(
  email: string
): Promise<DeactivateClientResult> {
  try {
    const res = await axios.patch<DeactivateClientResponse>(
      "/clients/deactivate",
      null,
      { params: { email } }
    );
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        ok: false,
        data: {
          error: getErrorDisplay(
            err,
            "Network error while deactivating client."
          ),
        },
      };
    }
    return {
      ok: false,
      data: {
        error: "An unexpected error occurred while deactivating client.",
      },
    };
  }
}
