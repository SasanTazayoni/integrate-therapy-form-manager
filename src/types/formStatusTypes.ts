import type { FormType } from "../constants/formTypes";

export type ClientFormsStatus = {
  exists: boolean;
  clientName?: string;
  clientDob?: string;
  clientStatus: "active" | "inactive";
  forms: Record<FormType, FormStatus>;
  formsCompleted?: number;
  inactive?: boolean;
  scores?: {
    bdi?: { bdi_score: string; submitted_at: string | null } | null;
    bai?: { bai_score: string; submitted_at: string | null } | null;
    smi?: Record<string, string | null>;
    ysq?: Record<string, string | null>;
    ysq456?: Record<string, string | null>;
  };
};

export type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
  submittedAt?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
  revokedAt?: string;
};
