export { FORM_TYPES, type FormType } from "../../backend/data/formTypes";
import type { FormType } from "../../backend/data/formTypes";

export const FORM_TITLES: Record<FormType, string> = {
  YSQ: "Young Schema Questionnaire (YSQ)",
  SMI: "Schema Mode Inventory (SMI)",
  BECKS: "Beck's Depression Inventory (BDI)",
  BURNS: "Burn's Anxiety Inventory (BAI)",
};
