import { Request, Response } from "express";
import prisma from "../prisma/client";

type FormStatus = {
  activeToken: boolean;
  submitted: boolean;
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
    res.status(400).json({ error: "Email query param is required" });
    return;
  }

  try {
    const client: Client | null = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      const emptyFormsStatus: FormsStatusRecord = {
        YSQ: { activeToken: false, submitted: false },
        SMI: { activeToken: false, submitted: false },
        BECKS: { activeToken: false, submitted: false },
        BURNS: { activeToken: false, submitted: false },
      };

      res.json({ exists: false, forms: emptyFormsStatus });
      return;
    }

    const forms: Form[] = await prisma.form.findMany({
      where: { clientId: client.id },
    });

    const formTypes: string[] = ["YSQ", "SMI", "BECKS", "BURNS"];

    const formsStatus: FormsStatusRecord = formTypes.reduce(
      (acc: FormsStatusRecord, type: string): FormsStatusRecord => {
        const formsOfType: Form[] = forms.filter(
          (f: Form) => f.form_type === type
        );

        const activeToken: boolean = formsOfType.some(
          (f: Form) =>
            f.is_active === true &&
            !f.submitted_at &&
            new Date(f.token_expires_at) > new Date()
        );

        const submitted: boolean = formsOfType.some(
          (f: Form) => !!f.submitted_at
        );

        acc[type] = { activeToken, submitted };
        return acc;
      },
      {} as FormsStatusRecord
    );

    const formsCompleted = formTypes.reduce((count, type) => {
      return formsStatus[type].submitted ? count + 1 : count;
    }, 0);

    res.json({ exists: true, forms: formsStatus, formsCompleted });
  } catch (error: unknown) {
    console.error("Error fetching client forms status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, name, dob } = req.body;

  if (!email || !name || !dob) {
    res
      .status(400)
      .json({ error: "Email, name, and date of birth are required" });
    return;
  }

  try {
    const client = await prisma.client.create({
      data: {
        email: email.toLowerCase(),
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
