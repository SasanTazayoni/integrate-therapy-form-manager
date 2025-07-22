import prisma from "../prisma/client";
import crypto from "crypto";
import { sendEmailToClient } from "./sendEmail";

export async function createTokenAndSendEmail(email: string, formType: string) {
  const client = await prisma.client.findUnique({ where: { email } });
  if (!client) {
    throw new Error("Client not found");
  }

  const existingToken = await prisma.form.findFirst({
    where: {
      clientId: client.id,
      form_type: formType,
      token_used_at: null,
      is_active: true,
    },
  });

  if (existingToken) {
    throw new Error("Active token already exists for this form");
  }

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

  await prisma.form.create({
    data: {
      token,
      clientId: client.id,
      form_type: formType,
      token_sent_at: now,
      token_expires_at: expiresAt,
      token_used_at: null,
      is_active: true,
      submitted_at: null,
    },
  });

  const formUrl = `https://yourdomain.com/forms/${formType.toLowerCase()}/${token}`;

  await sendEmailToClient(email, {
    subject: `Your ${formType} form`,
    body: `Please complete your form at: ${formUrl}`,
  });

  return { email, formType, token };
}
