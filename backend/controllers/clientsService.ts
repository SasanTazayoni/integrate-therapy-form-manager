import { Client, Form } from "@prisma/client";
import {
  findClientByEmail,
  getFormsByClientId,
  createNewClient,
} from "./clientsRepository";
import { FORM_TYPES, FormType } from "../data/formTypes";
import { normalizeEmail } from "../utils/normalizeEmail";
import { getLatestForm } from "../utils/formHelpers";
import { CLIENT_STATUS } from "../data/clientStatus";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { getScoreCategory } from "../utils/YSQScoreUtils";
import { SchemaType } from "../data/YSQBoundariesBackend";
import { classifyScore } from "../utils/SMIScoreUtilsBackend";
import { smiBoundaries } from "../data/SMIBoundariesBackend";

export type FormStatus = {
  activeToken: boolean;
  submitted: boolean;
  submittedAt?: Date | null;
  tokenCreatedAt?: Date | null;
  tokenExpiresAt?: Date | null;
  revokedAt?: Date | null;
};

export type Scores = {
  bdi: { bdi_score: string; submitted_at: string | null } | null;
  bai: { bai_score: string; submitted_at: string | null } | null;
  ysq: Record<string, string | null>;
  ysq456: Record<string, string | null>;
  smi: Record<string, string | null> & { submitted_at?: string | null };
};

export const getClientFormsStatus = async (
  emailRaw: string | undefined
): Promise<{
  clientExists: boolean;
  clientName?: string | null;
  clientDob?: string | null;
  clientStatus?: string;
  inactivatedAt?: string | null;
  inactive?: boolean;
  formsStatus?: Record<FormType, FormStatus>;
  formsCompleted?: number;
  scores?: Scores;
  error?: string;
}> => {
  if (!emailRaw) return { clientExists: false, error: "Email is required" };
  const email = normalizeEmail(emailRaw);
  const client = await findClientByEmail(email);
  if (!client) return { clientExists: false, error: "Client not found" };

  const forms = await getFormsByClientId(client.id);

  const bdiForm = getLatestForm(forms, (f) => f.bdi_score != null);
  const baiForm = getLatestForm(forms, (f) => f.bai_score != null);

  const extractScores = (
    form: Form | undefined,
    formTypePrefix: string,
    scoreKeyFilter: ((key: string) => boolean) | undefined,
    labelFn: (key: string, value: number) => string
  ): Record<string, string | null> => {
    const scores: Record<string, string | null> = {};
    if (!form) return scores;
    Object.entries(form).forEach(([key, value]) => {
      if (key.startsWith(formTypePrefix) && (!scoreKeyFilter || scoreKeyFilter(key))) {
        if (value === null) {
          scores[key] = null;
        } else {
          const num = value as number;
          const label = labelFn(key, num);
          scores[key] = label ? `${num}-${label}` : String(num);
        }
      }
    });
    return scores;
  };

  const latestSmiForm = getLatestForm(forms, (f) => f.form_type === "SMI");
  const smiScores = extractScores(
    latestSmiForm,
    "smi_",
    undefined,
    (key, value) => {
      const boundaries = smiBoundaries[key];
      return boundaries ? classifyScore(value, boundaries) : "";
    }
  );
  const smiSubmittedAt = latestSmiForm?.submitted_at?.toISOString() ?? null;

  const latestYsqForm = getLatestForm(forms, (f) => f.form_type === "YSQ");
  const ysqScores = extractScores(
    latestYsqForm,
    "ysq_",
    (key) => key.endsWith("_score"),
    (key, value) => {
      const schema = key.replace("ysq_", "").replace("_score", "").toUpperCase() as SchemaType;
      return getScoreCategory(schema, value);
    }
  );
  const ysq456Scores = extractScores(
    latestYsqForm,
    "ysq_",
    (key) => key.endsWith("_456"),
    (key, value) => {
      const schema = key.replace("ysq_", "").replace("_456", "").toUpperCase() as SchemaType;
      return getScoreCategory(schema, value);
    }
  );

  const formsStatus: Record<FormType, FormStatus> = {} as Record<
    FormType,
    FormStatus
  >;

  for (const type of FORM_TYPES) {
    const mostRecent = forms
      .filter((f) => f.form_type === type)
      .sort((a, b) => b.token_sent_at.getTime() - a.token_sent_at.getTime())[0];

    const everSubmitted =
      type === "SMI"
        ? forms.some((f) => f.form_type === "SMI" && f.submitted_at !== null)
        : !!mostRecent?.submitted_at;

    formsStatus[type] = mostRecent
      ? {
          activeToken:
            mostRecent.is_active &&
            !mostRecent.submitted_at &&
            mostRecent.token_expires_at > new Date(),
          submitted: everSubmitted,
          submittedAt: mostRecent.submitted_at,
          tokenCreatedAt: mostRecent.token_sent_at,
          tokenExpiresAt: mostRecent.token_expires_at,
          revokedAt: mostRecent.revoked_at,
        }
      : { activeToken: false, submitted: false, revokedAt: null };
  }

  const formsCompleted = FORM_TYPES.reduce(
    (count, type) => (formsStatus[type].submitted ? count + 1 : count),
    0
  );

  const inactive = client.status !== CLIENT_STATUS.ACTIVE || Boolean(client.inactivated_at);

  return {
    clientExists: true,
    clientName: client.name ?? null,
    clientDob: client.dob ? client.dob.toISOString() : null,
    clientStatus: client.status,
    inactivatedAt: client.inactivated_at?.toISOString() ?? null,
    inactive,
    formsStatus,
    formsCompleted,
    scores: {
      bdi: bdiForm
        ? {
            bdi_score: `${bdiForm.bdi_score!}-${getBecksScoreCategory(bdiForm.bdi_score!)}`,
            submitted_at: bdiForm.submitted_at?.toISOString() ?? null,
          }
        : null,
      bai: baiForm
        ? {
            bai_score: `${baiForm.bai_score!}-${getBurnsScoreCategory(baiForm.bai_score!)}`,
            submitted_at: baiForm.submitted_at?.toISOString() ?? null,
          }
        : null,
      smi: {
        ...smiScores,
        submitted_at: smiSubmittedAt,
      },
      ysq: ysqScores,
      ysq456: ysq456Scores,
    },
  };
};

export const createClient = async (data: {
  email?: string;
  name?: string | null;
  dob?: string | Date | null;
}): Promise<{ client?: Client; error?: string }> => {
  if (!data.email) return { error: "Email is required" };

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
