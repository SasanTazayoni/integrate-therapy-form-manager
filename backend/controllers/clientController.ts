import { Request, Response } from "express";
import prisma from "../prisma/client";

type FormStatus = {
  activeToken: boolean;
  submitted: boolean;
  submittedAt?: Date | null;
  tokenCreatedAt?: Date | null;
  tokenExpiresAt?: Date | null;
};

type FormsStatusRecord = Record<string, FormStatus>;

type Client = {
  id: string;
  email: string;
  name?: string | null;
  dob?: Date | null;
  status: string;
  inactivated_at?: Date | null;
  created_at: Date;
  updated_at: Date;
};

type Form = {
  id: string;
  clientId: string;
  form_type: string;
  token: string;
  token_sent_at: Date;
  token_expires_at: Date;
  is_active: boolean;
  submitted_at: Date | null;
  total_score?: number | null;
  created_at: Date;
  updated_at: Date;
};

export const getClientFormsStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const email: string | undefined = (
    req.query.email as string | undefined
  )?.toLowerCase();

  if (!email) {
    console.warn("❌ No email provided in query");
    res.status(400).json({ error: "Email query param is required" });
    return;
  }

  try {
    const client: Client | null = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      console.log(`📭 No client found for email: ${email}`);
      res.status(404).json({ error: "Client not found" });
      return;
    }

    console.log(`✅ Client found for email: ${email} (id: ${client.id})`);

    const forms: Form[] = await prisma.form.findMany({
      where: { clientId: client.id },
    });

    const formTypes: string[] = ["YSQ", "SMI", "BECKS", "BURNS"];

    const formsStatus: Record<string, FormStatus> = {};

    for (const type of formTypes) {
      const formsOfType = forms
        .filter((f) => f.form_type === type)
        .sort((a, b) => b.token_sent_at.getTime() - a.token_sent_at.getTime());

      const mostRecent = formsOfType[0];

      if (mostRecent) {
        formsStatus[type] = {
          activeToken:
            mostRecent.is_active &&
            !mostRecent.submitted_at &&
            new Date(mostRecent.token_expires_at) > new Date(),
          submitted: !!mostRecent.submitted_at,
          submittedAt: mostRecent.submitted_at,
          tokenCreatedAt: mostRecent.token_sent_at,
          tokenExpiresAt: mostRecent.token_expires_at,
        };
      } else {
        formsStatus[type] = {
          activeToken: false,
          submitted: false,
        };
      }
    }

    const formsCompleted = formTypes.reduce((count, type) => {
      return formsStatus[type].submitted ? count + 1 : count;
    }, 0);

    console.log(`📄 Forms status for ${email}:`, formsStatus);

    res.json({ exists: true, forms: formsStatus, formsCompleted });
  } catch (error: unknown) {
    console.error("❌ Error fetching client forms status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, name, dob } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const client = await prisma.client.create({
      data: {
        email: email.toLowerCase(),
        name: name ?? null,
        dob: dob ? new Date(dob) : null,
        status: "active",
      },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
};
