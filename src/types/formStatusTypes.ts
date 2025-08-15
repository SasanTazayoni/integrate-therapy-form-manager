import type { FormType } from "../constants/formTypes";

export type ClientFormsStatus = {
  exists: boolean;
  clientName?: string;
  clientDob?: string;
  forms: Record<FormType, FormStatus>;
  formsCompleted?: number;
  smiScores?: Record<string, number | null>;
};

export type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
  submittedAt?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
  revokedAt?: string;
};
