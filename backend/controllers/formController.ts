import { Request, Response } from "express";
import prisma from "../prisma/client";
import { sendFormLink } from "../utils/sendFormLink";
import { FORM_TYPES, FormType } from "../utils/formTypes";
import { generateToken, computeExpiry } from "../utils/tokens";
import { findClientByEmail } from "../utils/clientUtils";
import { deactivateInvalidActiveForms } from "../utils/formUtils";
import { parseDateStrict } from "../utils/dates";
import { getValidFormByToken } from "./formControllerHelpers/formTokenHelpers";

export const createForm = async (
  req: Request<{}, unknown, { clientId: string; formType: FormType }>,
  res: Response
) => {
  const { clientId, formType } = req.body;

  if (!clientId || !formType || !FORM_TYPES.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const token = generateToken();
    const now = new Date();
    const expiresAt = computeExpiry(now);

    const form = await prisma.form.create({
      data: {
        clientId,
        form_type: formType,
        token,
        token_sent_at: now,
        token_expires_at: expiresAt,
        is_active: true,
        submitted_at: null,
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Failed to create form" });
  }
};

export const sendForm = async (
  req: Request<{ formType: FormType }, unknown, { email: string }>,
  res: Response
) => {
  const { email } = req.body;
  const { formType } = req.params;

  if (!email || !formType || !FORM_TYPES.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const client = await findClientByEmail(email);
    if (!client) return res.status(404).json({ error: "Client not found" });

    await deactivateInvalidActiveForms(client.id, formType);

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

    const token = generateToken();
    const now = new Date();
    const expiresAt = computeExpiry(now);

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

export const validateToken = async (
  req: Request<{}, unknown, unknown, { token?: string }>,
  res: Response
) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, message: "Missing token" });
  }

  try {
    const form = await getValidFormByToken(token);

    if (!form) {
      return res
        .status(403)
        .json({ valid: false, message: "Token is invalid or expired" });
    }

    return res.json({
      valid: true,
      questionnaire: form.form_type,
      client: {
        name: form.client?.name ?? null,
        dob: form.client?.dob ?? null,
      },
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return res
      .status(500)
      .json({ valid: false, message: "Server error validating token" });
  }
};

export const revokeFormToken = async (
  req: Request<{ formType: FormType }, unknown, { email: string }>,
  res: Response
) => {
  const { formType } = req.params;
  const { email } = req.body;

  if (!email || !formType || !FORM_TYPES.includes(formType)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const client = await findClientByEmail(email);
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

export const updateClientInfo = async (req: Request, res: Response) => {
  const { token, name, dob } = req.body;

  if (!token || !name || !dob) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { token },
      include: { client: true },
    });

    if (!form || !form.client) {
      return res.status(404).json({ message: "Form or client not found" });
    }

    const parsedDob = parseDateStrict(dob);
    if (!parsedDob) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    await prisma.client.update({
      where: { id: form.client.id },
      data: {
        name,
        dob: parsedDob,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating client info:", error);
    return res
      .status(500)
      .json({ message: "Server error updating client info" });
  }
};
