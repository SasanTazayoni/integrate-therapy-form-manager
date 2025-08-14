import { Request, Response } from "express";
import { getClientFormsStatus, createClient } from "./clientsService";

export const getClientFormsStatusHandler = async (
  req: Request,
  res: Response
) => {
  const email = req.query.email as string | undefined;

  const result = await getClientFormsStatus(email);

  if (result.error) {
    if (result.error === "Email is required") {
      res.status(400).json({ error: result.error });
    } else if (result.error === "Client not found") {
      res.status(404).json({ error: result.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  res.json({
    exists: result.clientExists,
    clientName: result.clientName ?? null,
    forms: result.formsStatus,
    formsCompleted: result.formsCompleted,
    smiScores: result.smiScoresByForm ?? {},
  });
};

export const createClientHandler = async (req: Request, res: Response) => {
  const { email, name, dob } = req.body;

  const result = await createClient({ email, name, dob });

  if (result.error) {
    if (result.error === "Email is required") {
      res.status(400).json({ error: result.error });
    } else {
      res.status(500).json({ error: result.error });
    }
    return;
  }

  res.status(201).json(result.client);
};
