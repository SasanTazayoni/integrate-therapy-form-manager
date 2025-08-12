import { Request, Response } from "express";
import prisma from "../prisma/client";
import { validateTokenOrFail } from "./formControllerHelpers/formTokenHelpers";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { validateRequestBodyFields } from "../utils/validationUtils";
import { SchemaType, getScoreCategory } from "../utils/YSQScoreUtils";
import { parseAndCombineScore } from "../utils/scoreUtils";
import { smiBoundaries, labels } from "../utils/SMIScoreUtils";

const YSQ_SCHEMAS = [
  "ed",
  "ab",
  "ma",
  "si",
  "ds",
  "fa",
  "di",
  "vu",
  "eu",
  "sb",
  "ss",
  "ei",
  "us",
  "et",
  "is",
  "as",
  "np",
  "pu",
] as const;

type YSQSchemaCode = (typeof YSQ_SCHEMAS)[number];

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
      scores: Partial<Record<`ysq_${YSQSchemaCode}_answers`, number[]>>;
    }
  >,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "scores"]);
  if (!validation.valid) return;

  const { token, scores } = req.body;

  if (!scores) {
    return res.status(400).json({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const now = new Date();
    const dataUpdate: Record<string, any> = {
      submitted_at: now,
      is_active: false,
      token_expires_at: now,
    };

    for (const schema of YSQ_SCHEMAS) {
      const key = `ysq_${schema}_answers` as keyof typeof scores;
      const answers = scores[key];

      if (!answers || !Array.isArray(answers)) {
        continue;
      }

      const numericAnswers = answers.map((v) => Number(v) || 0);
      const rawScore = numericAnswers.reduce((sum, val) => sum + val, 0);
      const rawCategory = getScoreCategory(
        schema.toUpperCase() as SchemaType,
        rawScore
      );
      const rawCombined = `${rawScore}-${rawCategory}`;
      const score456 = numericAnswers
        .filter((val) => val >= 4 && val <= 6)
        .reduce((sum, val) => sum + val, 0);
      const score456Category = getScoreCategory(
        schema.toUpperCase() as SchemaType,
        score456
      );
      const score456Combined = `${score456}-${score456Category}`;

      dataUpdate[`ysq_${schema}_score`] = rawCombined;
      dataUpdate[`ysq_${schema}_456`] = score456Combined;
    }

    await prisma.form.update({
      where: { token },
      data: dataUpdate,
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

function classifyScore(score: number, boundaries: number[]): string {
  let closestIndex = 0;
  let smallestDiff = Infinity;
  boundaries.forEach((boundary, idx) => {
    const diff = Math.abs(score - boundary);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = idx;
    }
  });
  return labels[closestIndex];
}

const labelToBoundaryKey: Record<string, string> = {
  "vulnerable child": "smi_vc_score",
  "angry child": "smi_ac_score",
  "enraged child": "smi_ec_score",
  "impulsive child": "smi_ic_score",
  "undisciplined child": "smi_uc_score",
  "contented child": "smi_cc_score",
  "compliant surrenderer": "smi_cs_score",
  "detached protector": "smi_dp_score",
  "detached self soother": "smi_dss_score",
  "self aggrandizer": "smi_sa_score",
  "bully and attack": "smi_ba_score",
  "punitive parent": "smi_pp_score",
  "demanding parent": "smi_dc_score",
  "healthy adult": "smi_ha_score",
};

function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[\(\)\-\–]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const submitSMIForm = async (
  req: Request<
    {},
    unknown,
    {
      token: string;
      results: Record<string, { average: number }>;
    }
  >,
  res: Response
) => {
  const validation = validateRequestBodyFields(req, res, ["token", "results"]);
  if (!validation.valid) return;

  const { token, results } = req.body;

  if (!results || typeof results !== "object") {
    return res.status(400).json({
      error: "Invalid or missing results object",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const now = new Date();
    const dataUpdate: Record<string, any> = {
      submitted_at: now,
      is_active: false,
      token_expires_at: now,
    };

    for (const incomingKey in results) {
      const avg = Number(results[incomingKey]?.average);
      if (isNaN(avg)) {
        console.warn(
          `Invalid average for key ${incomingKey}:`,
          results[incomingKey]
        );
        continue;
      }

      let boundaryKey: string | undefined;

      if (incomingKey.startsWith("smi_") && smiBoundaries[incomingKey]) {
        boundaryKey = incomingKey;
      } else {
        const normalized = normalizeLabel(incomingKey);
        boundaryKey = labelToBoundaryKey[normalized];
      }

      if (!boundaryKey || !smiBoundaries[boundaryKey]) {
        console.warn(`No boundaries found for SMI key: ${incomingKey}`);
        continue;
      }

      const category = classifyScore(avg, smiBoundaries[boundaryKey]);
      dataUpdate[boundaryKey] = `${avg.toFixed(2)}-${category}`;
    }

    await prisma.form.update({
      where: { token },
      data: dataUpdate,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error submitting SMI form:", error);
    return res.status(500).json({
      error: "Failed to submit SMI form",
      code: "SUBMIT_ERROR",
    });
  }
};
