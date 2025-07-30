export const FORM_TYPES = ["YSQ", "SMI", "BECKS", "BURNS"] as const;
export type FormType = (typeof FORM_TYPES)[number];
