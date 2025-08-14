import {
  Client,
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
  clientName?: string | null;
  formsStatus?: Record<FormType, FormStatus>;
  formsCompleted?: number;
  smiScoresByForm?: Record<string, Record<string, string | null>>;
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
  const smiScoresByForm: Record<string, Record<string, string | null>> = {};

  for (const form of forms) {
    const smiScores = Object.entries(form)
      .filter(([key]) => key.startsWith("smi_"))
      .reduce((acc, [key, value]) => {
        acc[key] = value !== null ? String(value) : null;
        return acc;
      }, {} as Record<string, string | null>);

    if (Object.keys(smiScores).length > 0) {
      smiScoresByForm[form.form_type] = {
        ...smiScores,
        submitted_at: form.submitted_at
          ? form.submitted_at.toISOString()
          : null,
      };
    }
  }

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
          mostRecent.token_expires_at > new Date(),
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

  return {
    clientExists: true,
    clientName: client.name ?? null,
    formsStatus,
    formsCompleted,
    smiScoresByForm,
  };
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
