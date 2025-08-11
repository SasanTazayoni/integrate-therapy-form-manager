import { Request, Response } from "express";
import prisma from "../prisma/client";
import { validateTokenOrFail } from "./formControllerHelpers/formTokenHelpers";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { validateRequestBodyFields } from "../utils/validationUtils";
import { SchemaType, getScoreCategory } from "../utils/YSQScoreUtils";
import { parseAndCombineScore } from "../utils/scoreUtils";

export const submitBecksForm = async (
  req: Request<{}, unknown, { token: string; result: string }>,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "result"]);
  if (!validation.valid) return;

  const { token, result } = req.body;

  try {
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const combinedScore = parseAndCombineScore(result, getBecksScoreCategory);
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
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const combinedScore = parseAndCombineScore(result, getBurnsScoreCategory);
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
    {
      token: string;
      scores: { ysq_ed_answers?: number[]; ysq_ab_answers?: number[] };
    }
  >,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "scores"]);
  if (!validation.valid) return;

  const { token, scores } = req.body;

  if (
    !scores ||
    !Array.isArray(scores.ysq_ed_answers) ||
    !Array.isArray(scores.ysq_ab_answers)
  ) {
    return res.status(400).json({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const edAnswers = scores.ysq_ed_answers.map((v) => Number(v) || 0);
    const edRawScore = edAnswers.reduce((sum, val) => sum + val, 0);
    const edRawCategory = getScoreCategory("ED" as SchemaType, edRawScore);
    const edRawCombined = `${edRawScore}-${edRawCategory}`;

    const edScore456 = edAnswers
      .filter((val) => val >= 4 && val <= 6)
      .reduce((sum, val) => sum + val, 0);
    const edScore456Category = getScoreCategory("ED" as SchemaType, edScore456);
    const edScore456Combined = `${edScore456}-${edScore456Category}`;
    const abAnswers = scores.ysq_ab_answers.map((v) => Number(v) || 0);
    const abRawScore = abAnswers.reduce((sum, val) => sum + val, 0);
    const abRawCategory = getScoreCategory("AB" as SchemaType, abRawScore);
    const abRawCombined = `${abRawScore}-${abRawCategory}`;

    const abScore456 = abAnswers
      .filter((val) => val >= 4 && val <= 6)
      .reduce((sum, val) => sum + val, 0);
    const abScore456Category = getScoreCategory("AB" as SchemaType, abScore456);
    const abScore456Combined = `${abScore456}-${abScore456Category}`;

    const now = new Date();

    await prisma.form.update({
      where: { token },
      data: {
        submitted_at: now,
        ysq_ed_score: edRawCombined,
        ysq_ed_456: edScore456Combined,
        ysq_ab_score: abRawCombined,
        ysq_ab_456: abScore456Combined,
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
