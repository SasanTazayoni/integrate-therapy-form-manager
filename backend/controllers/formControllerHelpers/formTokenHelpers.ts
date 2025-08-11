import prisma from "../../prisma/client";
import { isFormTokenUsable } from "../../utils/formUtils";

export async function getValidFormByToken(token: string) {
  if (!token) return null;

  const form = await prisma.form.findUnique({
    where: { token },
    include: { client: true },
  });

  if (!form) return null;

  if (!isFormTokenUsable(form)) return null;

  return form;
}
