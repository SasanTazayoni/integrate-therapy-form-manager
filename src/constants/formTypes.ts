export const FORM_TYPES = ["YSQ", "SMI", "BECKS", "BURNS"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const FORM_TITLES: Record<FormType, string> = {
  YSQ: "Young Schema Questionnaire (YSQ) Form",
  SMI: "Schema Mode Inventory (SMI) Form",
  BECKS: "Beck's Depression Inventory (BDI) Form",
  BURNS: "Burn's Anxiety Inventory (BAI) Form",
};
