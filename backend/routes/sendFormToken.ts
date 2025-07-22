import express from "express";
import prisma from "../prisma/client";
import crypto from "crypto";
import { sendEmailToClient } from "../utils/sendEmail";

const router = express.Router();

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

router.post("/api/forms/:formType/send-token", async (req, res) => {
  const { email } = req.body;
  const { formType } = req.params;

  if (!email || !formType) {
    return res.status(400).json({ error: "Missing email or form type" });
  }

  try {
    const result = await createTokenAndSendEmail(email, formType);
    res.status(200).json({ message: "Token sent", result });
  } catch (err: any) {
    console.error("Error in send-token route:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
