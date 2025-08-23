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
