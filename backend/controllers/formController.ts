import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Form } from "@prisma/client";
import { sendFormLink } from "../utils/sendFormLink";
import { FORM_TYPES, FormType } from "../data/formTypes";
import { generateToken, computeExpiry } from "../utils/tokens";
import { findClientByEmail } from "../utils/clientUtils";
import { deactivateInvalidActiveForms } from "../utils/formUtils";
import { parseDateStrict } from "../utils/dates";
import { getValidFormByToken } from "./formControllerHelpers/formTokenHelpers";
import { getActiveForms, mapFormSafe } from "../utils/formHelpers";
import { sendMultipleFormLinks } from "../utils/sendMultipleFormLinks";
import { normalizeEmail } from "../utils/normalizeEmail";

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

    const existingForm = getActiveForms(
      await prisma.form.findMany({ where: { clientId: client.id } }),
      formType
    )[0];

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

    res
      .status(201)
      .json({ message: "Form sent via email", form: mapFormSafe(form) });
  } catch (error) {
    console.error("Error sending form:", error);
    res.status(500).json({ error: "Failed to send form" });
  }
};

export const sendMultipleForms = async (
  req: Request<{}, unknown, { email: string }>,
  res: Response
) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const client = await findClientByEmail(email);
    if (!client) return res.status(404).json({ error: "Client not found" });

    const now = new Date();
    const createdForms: Form[] = [];

    const allForms = await prisma.form.findMany({
      where: { clientId: client.id },
    });

    for (const formType of FORM_TYPES) {
      await deactivateInvalidActiveForms(client.id, formType);

      const existingActiveForm = await prisma.form.findFirst({
        where: {
          clientId: client.id,
          form_type: formType,
          is_active: true,
        },
      });

      const submittedForm = await prisma.form.findFirst({
        where: {
          clientId: client.id,
          form_type: formType,
          submitted_at: { not: null },
        },
      });

      if (existingActiveForm || (submittedForm && formType !== "SMI")) continue;

      const token = generateToken();
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

      createdForms.push(form);
    }

    if (createdForms.length === 0) {
      console.log(
        `No forms to send for ${client.email}: all forms are either active or already submitted.`
      );

      return res.status(409).json({
        message:
          "No forms to send. Active tokens or submitted forms already exist.",
      });
    }

    await sendMultipleFormLinks({
      email: client.email,
      clientName: client.name ?? undefined,
      forms: createdForms,
    });

    res.status(201).json({
      message: "Forms sent via email",
      sentForms: createdForms.map(mapFormSafe),
    });
  } catch (error) {
    console.error("Error sending multiple forms:", error);
    res.status(500).json({ error: "Failed to send multiple forms" });
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
    if (!client) return res.status(404).json({ error: "Client not found" });

    const result = await prisma.form.updateMany({
      where: {
        clientId: client.id,
        form_type: formType,
        is_active: true,
      },
      data: { is_active: false, revoked_at: new Date() },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ error: "No active form tokens found to revoke" });
    }

    const updatedForm = getActiveForms(
      await prisma.form.findMany({
        where: { clientId: client.id, form_type: formType },
      })
    ).sort(
      (a, b) => (b.revoked_at?.getTime() || 0) - (a.revoked_at?.getTime() || 0)
    )[0];

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
      data: { name, dob: parsedDob },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating client info:", error);
    return res
      .status(500)
      .json({ message: "Server error updating client info" });
  }
};

export const getAllSubmittedSMIForms = async (req: Request, res: Response) => {
  const emailRaw = req.query.email as string | undefined;

  if (!emailRaw) {
    return res.status(400).json({ error: "Email is required" });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const smiForms = await prisma.form.findMany({
      where: {
        clientId: client.id,
        form_type: "SMI",
        submitted_at: { not: null },
      },
      orderBy: { submitted_at: "desc" },
    });

    const results = smiForms.map((form) => ({
      id: form.id,
      submittedAt: form.submitted_at,
      smiScores: {
        dp: form.smi_dp_score,
        dss: form.smi_dss_score,
        ba: form.smi_ba_score,
        sa: form.smi_sa_score,
        cs: form.smi_cs_score,
        ic: form.smi_ic_score,
        uc: form.smi_uc_score,
        cc: form.smi_cc_score,
        vc: form.smi_vc_score,
        dc: form.smi_dc_score,
        pp: form.smi_pp_score,
        ac: form.smi_ac_score,
        ec: form.smi_ec_score,
        ha: form.smi_ha_score,
      },
    }));

    return res.json({ clientName: client.name ?? null, smiForms: results });
  } catch (error) {
    console.error("Error retrieving SMI submissions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
