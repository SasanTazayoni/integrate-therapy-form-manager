import { Request, Response } from "express";
import { getClientFormsStatus, createClient } from "./clientsService";
import { deleteClientByEmail } from "./clientDeletion";
import { deactivateClient, activateClient } from "./clientActivation";

export const getClientFormsStatusHandler = async (
  req: Request,
  res: Response
) => {
  const email = req.query.email as string | undefined;
  const result = await getClientFormsStatus(email);

  if (result.error) {
    if (result.error === "Email is required") {
      return res.status(400).json({ error: result.error });
    } else if (result.error === "Client not found") {
      return res.status(404).json({ error: result.error });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.json({
    exists: result.clientExists,
    clientName: result.clientName ?? null,
    clientDob: result.clientDob ?? null,
    inactive: result.inactive,
    forms: result.formsStatus,
    formsCompleted: result.formsCompleted,
    scores: result.scores ?? {
      bdi: null,
      bai: null,
      ysq: {},
      ysq456: {},
      smi: {},
    },
  });
};

export const createClientHandler = async (req: Request, res: Response) => {
  const { email, name, dob } = req.body;
  const result = await createClient({ email, name, dob });
  if (result.error) {
    if (result.error === "Email is required") {
      return res.status(400).json({ error: result.error });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }
  res.status(201).json(result.client);
};

export const deleteClientByEmailHandler = async (
  req: Request,
  res: Response
) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const client = await deleteClientByEmail(email);
    res.json({ message: "Client and all forms deleted", client });
  } catch (error: unknown) {
    console.error("Error deleting client:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete client";
    res.status(500).json({ error: errorMessage });
  }
};

export const deactivateClientHandler = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const result = await deactivateClient(email);
    if (!result.ok) {
      return res.status(500).json({ error: result.data.error });
    }
    res.json({ message: `Client ${email} deactivated`, client: result.data });
  } catch (error: unknown) {
    console.error("Error deactivating client:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to deactivate client";
    res.status(500).json({ error: errorMessage });
  }
};

export const activateClientHandler = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const result = await activateClient(email);
    if (!result.ok) {
      return res.status(500).json({ error: result.data.error });
    }
    res.json({ message: `Client ${email} activated`, client: result.data });
  } catch (error: unknown) {
    console.error("Error activating client:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to activate client";
    res.status(500).json({ error: errorMessage });
  }
};
