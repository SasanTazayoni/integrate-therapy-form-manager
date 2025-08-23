import { Form } from "@prisma/client";

export const getLatestForm = (
  forms: Form[],
  filterFn: (f: Form) => boolean
): Form | undefined =>
  forms
    .filter(filterFn)
    .sort(
      (a, b) =>
        (b.submitted_at?.getTime() || 0) - (a.submitted_at?.getTime() || 0)
    )[0];

export const getActiveForms = (forms: Form[], formType?: string) =>
  forms.filter((f) => f.is_active && (!formType || f.form_type === formType));

export const getInactiveForms = (forms: Form[]) =>
  forms.filter((f) => !f.is_active);

export const mapFormSafe = (form: Form | null | undefined) => ({
  token: form?.token ?? null,
  formType: form?.form_type ?? null,
  submittedAt: form?.submitted_at ?? null,
  isActive: form?.is_active ?? false,
});
