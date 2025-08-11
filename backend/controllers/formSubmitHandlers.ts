import { Request, Response } from "express";
import prisma from "../prisma/client";
import { getValidFormByToken } from "./formControllerHelpers/formTokenHelpers";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import getEDScoreCategory from "../utils/YSQScoreUtils";
import { validateRequestBodyFields } from "../utils/validationUtils";

export const submitBecksForm = async (
  req: Request<{}, unknown, { token: string; result: string }>,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "result"]);
  if (!validation.valid) return;

  const { token, result } = req.body;

  try {
    const form = await getValidFormByToken(token);

    if (!form) {
      return res.status(403).json({
        error: "Token is invalid or expired",
        code: "INVALID_TOKEN",
      });
    }

    const score = Number.isInteger(parseInt(result)) ? parseInt(result) : 0;
    const scoreCategory = getBecksScoreCategory(score);
    const combinedScore = `${score}-${scoreCategory}`;
    const now = new Date();

    await prisma.form.update({
      where: { token },
      data: {
        submitted_at: now,
        bdi_score: combinedScore,
        is_active: false,
        token_expires_at: now,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error submitting form:", error);
    return res.status(500).json({
      error: "Failed to submit form",
      code: "SUBMIT_ERROR",
    });
  }
};

export const submitBurnsForm = async (
  req: Request<{}, unknown, { token: string; result: string }>,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "result"]);
  if (!validation.valid) return;

  const { token, result } = req.body;

  try {
    const form = await getValidFormByToken(token);

    if (!form) {
      return res.status(403).json({
        error: "Token is invalid or expired",
        code: "INVALID_TOKEN",
      });
    }

    const score = Number.isInteger(parseInt(result)) ? parseInt(result) : 0;
    const scoreCategory = getBurnsScoreCategory(score);
    const combinedScore = `${score}-${scoreCategory}`;
    const now = new Date();

    await prisma.form.update({
      where: { token },
      data: {
        submitted_at: now,
        bai_score: combinedScore,
        is_active: false,
        token_expires_at: now,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error submitting BURNS form:", error);
    return res.status(500).json({
      error: "Failed to submit form",
      code: "SUBMIT_ERROR",
    });
  }
};

export const submitYSQForm = async (
  req: Request<
    {},
    unknown,
    { token: string; scores: { ysq_ed_answers?: number[] } }
  >,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "scores"]);
  if (!validation.valid) return;

  const { token, scores } = req.body;

  if (!scores || !Array.isArray(scores.ysq_ed_answers)) {
    return res.status(400).json({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const form = await getValidFormByToken(token);

    if (!form) {
      return res.status(403).json({
        error: "Token is invalid or expired",
        code: "INVALID_TOKEN",
      });
    }

    const answers = scores.ysq_ed_answers.map((v) => Number(v) || 0);

    const rawScore = answers.reduce((sum, val) => sum + val, 0);
    const rawCategory = getEDScoreCategory(rawScore);
    const rawCombined = `${rawScore}-${rawCategory}`;

    const score456 = answers
      .filter((val) => val >= 4 && val <= 6)
      .reduce((sum, val) => sum + val, 0);
    const score456Category = getEDScoreCategory(score456);
    const score456Combined = `${score456}-${score456Category}`;

    const now = new Date();

    await prisma.form.update({
      where: { token },
      data: {
        submitted_at: now,
        ysq_ed_score: rawCombined,
        ysq_ed_456: score456Combined,
        is_active: false,
        token_expires_at: now,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error submitting YSQ form:", error);
    return res.status(500).json({
      error: "Failed to submit YSQ form",
      code: "SUBMIT_ERROR",
    });
  }
};
