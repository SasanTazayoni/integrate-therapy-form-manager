import prisma from "../prisma/client";
import { FormType } from "../utils/formTypes";

export function isTokenExpired(expiresAt: Date, now = new Date()) {
  return new Date(expiresAt) < now;
}

export function isFormTokenUsable(form: {
  is_active: boolean;
  token_expires_at: Date;
  submitted_at: Date | null;
}) {
  return (
    form.is_active &&
    !form.submitted_at &&
    !isTokenExpired(form.token_expires_at)
  );
}

export async function deactivateInvalidActiveForms(
  clientId: string,
  formType: FormType
) {
  return prisma.form.updateMany({
    where: {
      clientId,
      form_type: formType,
      is_active: true,
      OR: [
        { token_expires_at: { lt: new Date() } },
        { submitted_at: { not: null } },
        { revoked_at: { not: null } },
      ],
    },
    data: { is_active: false },
  });
}
