import {
  Client,
  Form,
  findClientByEmail,
  getFormsByClientId,
  createNewClient,
} from "./clientsRepository";
import { FORM_TYPES, FormType } from "../utils/formTypes";
import { normalizeEmail } from "../utils/normalizeEmail";

export type FormStatus = {
  activeToken: boolean;
  submitted: boolean;
  submittedAt?: Date | null;
  tokenCreatedAt?: Date | null;
  tokenExpiresAt?: Date | null;
  revokedAt?: Date | null;
};

export const getClientFormsStatus = async (
  emailRaw: string | undefined
): Promise<{
  clientExists: boolean;
  formsStatus?: Record<FormType, FormStatus>;
  formsCompleted?: number;
  error?: string;
}> => {
  if (!emailRaw) {
    return { clientExists: false, error: "Email is required" };
  }

  const email = normalizeEmail(emailRaw);
  const client = await findClientByEmail(email);

  if (!client) {
    return { clientExists: false, error: "Client not found" };
  }

  const forms = await getFormsByClientId(client.id);

  const formsStatus: Record<FormType, FormStatus> = {} as any;

  for (const type of FORM_TYPES) {
    const formsOfType = forms
      .filter((f) => f.form_type === type)
      .sort((a, b) => b.token_sent_at.getTime() - a.token_sent_at.getTime());

    const mostRecent = formsOfType[0];

    if (mostRecent) {
      formsStatus[type] = {
        activeToken:
          mostRecent.is_active &&
          !mostRecent.submitted_at &&
          new Date(mostRecent.token_expires_at) > new Date(),
        submitted: !!mostRecent.submitted_at,
        submittedAt: mostRecent.submitted_at,
        tokenCreatedAt: mostRecent.token_sent_at,
        tokenExpiresAt: mostRecent.token_expires_at,
        revokedAt: mostRecent.revoked_at,
      };
    } else {
      formsStatus[type] = {
        activeToken: false,
        submitted: false,
        revokedAt: null,
      };
    }
  }

  const formsCompleted = FORM_TYPES.reduce(
    (count, type) => (formsStatus[type].submitted ? count + 1 : count),
    0
  );

  return { clientExists: true, formsStatus, formsCompleted };
};

export const createClient = async (data: {
  email?: string;
  name?: string | null;
  dob?: string | Date | null;
}): Promise<{ client?: Client; error?: string }> => {
  if (!data.email) {
    return { error: "Email is required" };
  }

  try {
    const client = await createNewClient({
      email: normalizeEmail(data.email),
      name: data.name ?? null,
      dob: data.dob ? new Date(data.dob) : null,
    });
    return { client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client" };
  }
};
