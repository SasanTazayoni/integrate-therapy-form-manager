import prisma from "../../prisma/client";
import { isFormTokenUsable } from "../../utils/formUtils";
import { Response } from "express";

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

export async function validateTokenOrFail(token: string, res: Response) {
  const form = await getValidFormByToken(token);

  if (!form) {
    res.status(403).json({
      error: "Token is invalid or expired",
      code: "INVALID_TOKEN",
    });
    return null;
  }

  return form;
}
