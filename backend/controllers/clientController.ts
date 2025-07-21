import { Request, Response } from "express";
import prisma from "../prisma/client";

export const createClient = async (req: Request, res: Response) => {
  const { email, name, dob } = req.body;

  if (!email || !name || !dob) {
    return res.status(400).json({
      error: "Email, name, and date of birth are required",
    });
  }

  try {
    const client = await prisma.client.create({
      data: {
        email,
        name,
        dob: new Date(dob),
        status: "active",
      },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
};

export const getClientFormsStatus = async (req: Request, res: Response) => {
  const email = (req.query.email as string)?.toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email query param is required" });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      return res.json({
        exists: false,
        forms: {
          YSQ: { activeToken: false, submitted: false },
          SMI: { activeToken: false, submitted: false },
          BECKS: { activeToken: false, submitted: false },
          BURNS: { activeToken: false, submitted: false },
        },
      });
    }

    const forms = await prisma.form.findMany({
      where: { clientId: client.id },
    });

    const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];
    const formsStatus = formTypes.reduce(
      (acc, type) => {
        const formsOfType = forms.filter((f) => f.form_type === type);

        acc[type] = {
          activeToken: formsOfType.some((f) => f.is_active && !f.token_used_at),
          submitted: formsOfType.some((f) => !!f.submitted_at),
        };

        return acc;
      },
      {} as Record<string, { activeToken: boolean; submitted: boolean }>
    );

    res.json({ exists: true, forms: formsStatus });
  } catch (error) {
    console.error("Error fetching client forms status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
