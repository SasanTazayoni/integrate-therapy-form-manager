import { Request, Response } from "express";
import prisma from "../prisma/client";
import crypto from "crypto";
import { sendFormLink } from "../utils/sendFormLink";

const allowedFormTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

export const createForm = async (req: Request, res: Response) => {
  const { clientId, formType } = req.body;

  if (!clientId || !formType || !allowedFormTypes.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

    const form = await prisma.form.create({
      data: {
        clientId,
        form_type: formType,
        token,
        token_sent_at: now,
        token_expires_at: expiresAt,
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Failed to create form" });
  }
};

export const sendForm = async (req: Request, res: Response) => {
  const { email } = req.body;
  const { formType } = req.params;

  if (!email || !formType || !allowedFormTypes.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!client) return res.status(404).json({ error: "Client not found" });

    await prisma.form.updateMany({
      where: {
        clientId: client.id,
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

    const existingForm = await prisma.form.findFirst({
      where: {
        clientId: client.id,
        form_type: formType,
        submitted_at: null,
        is_active: true,
      },
    });

    if (existingForm) {
      return res
        .status(400)
        .json({ error: "Active token already exists for this form" });
    }

    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

    const form = await prisma.form.create({
      data: {
        token,
        clientId: client.id,
        form_type: formType,
        token_sent_at: now,
        token_expires_at: expiresAt,
        is_active: true,
        submitted_at: null,
      },
    });

    await sendFormLink({
      to: client.email,
      token,
      formType,
      clientName: client.name ?? undefined,
    });

    res.status(201).json({ message: "Form sent via email", form });
  } catch (error) {
    console.error("Error sending form:", error);
    res.status(500).json({ error: "Failed to send form" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, message: "Missing token" });
  }

  try {
    const form = await prisma.form.findUnique({ where: { token } });

    if (!form) {
      return res.status(404).json({ valid: false, message: "Form not found" });
    }

    const isExpired = new Date(form.token_expires_at) < new Date();
    const isSubmitted = !!form.submitted_at;

    if (!form.is_active || isExpired || isSubmitted) {
      return res
        .status(403)
        .json({ valid: false, message: "Token is invalid or expired" });
    }

    return res.json({ valid: true, questionnaire: form.form_type });
  } catch (error) {
    console.error("Error validating token:", error);
    return res
      .status(500)
      .json({ valid: false, message: "Server error validating token" });
  }
};

export const revokeFormToken = async (req: Request, res: Response) => {
  const { formType } = req.params;
  const { email } = req.body;

  if (!email || !formType || !allowedFormTypes.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const result = await prisma.form.updateMany({
      where: {
        clientId: client.id,
        form_type: formType,
        is_active: true,
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ error: "No active form tokens found to revoke" });
    }

    const updatedForm = await prisma.form.findFirst({
      where: {
        clientId: client.id,
        form_type: formType,
      },
      orderBy: { updated_at: "desc" },
      select: { revoked_at: true },
    });

    res.json({
      message: "Form token(s) revoked successfully",
      revokedAt: updatedForm?.revoked_at ?? null,
    });
  } catch (error) {
    console.error("Error revoking form token:", error);
    res.status(500).json({ error: "Failed to revoke form token" });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  const { token, fullName, dob, result } = req.body;

  if (!token || !fullName || !dob || !result) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { token },
      include: { client: true },
    });

    if (
      !form ||
      !form.is_active ||
      new Date(form.token_expires_at) < new Date()
    ) {
      return res.status(403).json({ error: "Token is invalid or expired" });
    }

    const now = new Date();

    await prisma.form.update({
      where: { token },
      data: {
        submitted_at: now,
        total_score: Number.isInteger(parseInt(result)) ? parseInt(result) : 0,
        is_active: false,
        token_expires_at: now,
      },
    });

    await prisma.client.update({
      where: { id: form.clientId },
      data: {
        name: fullName,
        dob: new Date(dob),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
};
