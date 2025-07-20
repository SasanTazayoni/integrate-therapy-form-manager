import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { sendFormLink } from "./utils/sendFormLink";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/clients", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const client = await prisma.client.create({
      data: {
        email,
        status: "active",
      },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

app.post("/forms", async (req, res) => {
  const { clientId, formType } = req.body;

  if (!clientId || !formType) {
    return res
      .status(400)
      .json({ error: "clientId and formType are required" });
  }

  const allowedFormTypes = ["YSQ", "SMI", "BECKS", "BURNS"];
  if (!allowedFormTypes.includes(formType)) {
    return res.status(400).json({ error: "Invalid formType" });
  }

  try {
    const token = nanoid(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24);

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
});

app.post("/forms/send", async (req, res) => {
  const { clientId, formType } = req.body;

  if (!clientId || !formType) {
    return res
      .status(400)
      .json({ error: "clientId and formType are required" });
  }

  const allowedFormTypes = ["YSQ", "SMI", "BECKS", "BURNS"];
  if (!allowedFormTypes.includes(formType)) {
    return res.status(400).json({ error: "Invalid formType" });
  }

  try {
    // Check client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Create form with token and expiry
    const token = nanoid(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24 hours

    const form = await prisma.form.create({
      data: {
        clientId,
        form_type: formType,
        token,
        token_sent_at: now,
        token_expires_at: expiresAt,
      },
    });

    // Send email with form link
    await sendFormLink({ to: client.email, token, formType });

    res.status(201).json({ message: "Form sent via email", form });
  } catch (error) {
    console.error("Error sending form:", error);
    res.status(500).json({ error: "Failed to send form" });
  }
});

app.get("/api/validate-token", async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, message: "Missing token" });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { token },
    });

    if (!form) {
      return res.status(404).json({ valid: false, message: "Form not found" });
    }

    const isExpired = new Date(form.token_expires_at) < new Date();
    const isUsed = form.token_used_at !== null;

    if (!form.is_active || isExpired || isUsed) {
      return res
        .status(403)
        .json({ valid: false, message: "Token is invalid or expired" });
    }

    return res.json({
      valid: true,
      questionnaire: form.form_type,
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return res
      .status(500)
      .json({ valid: false, message: "Server error validating token" });
  }
});

export default app;
