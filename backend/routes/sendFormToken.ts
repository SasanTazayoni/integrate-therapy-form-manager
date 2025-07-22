import express from "express";
import { createTokenAndSendEmail } from "../utils/formTokenHelper";

const router = express.Router();

router.post("/api/send-form-token", async (req, res) => {
  const { email, form } = req.body;

  if (!email || !form) {
    return res.status(400).json({ error: "Missing email or form type" });
  }

  try {
    const result = await createTokenAndSendEmail(email, form);
    res.status(200).json({ message: "Token sent", result });
  } catch (err: any) {
    console.error("Error in send-form-token route:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
