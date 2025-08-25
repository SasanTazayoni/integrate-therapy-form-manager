import { Request, Response } from "express";
import prisma from "../prisma/client";
import { validateTokenOrFail } from "./formControllerHelpers/formTokenHelpers";
import getBecksScoreCategory from "../utils/becksScoreUtils";
import getBurnsScoreCategory from "../utils/burnsScoreUtils";
import { validateRequestBodyFields } from "../utils/validationUtils";
import { getScoreCategory } from "../utils/YSQScoreUtils";
import { SchemaType } from "../data/YSQBoundariesBackend";
import { parseAndCombineScore } from "../utils/scoreUtils";
import { classifyScore, normalizeLabel } from "../utils/SMIScoreUtilsBackend";
import {
  smiBoundaries,
  labelToBoundaryKey,
} from "../data/SMIBoundariesBackend";
import { mapFormSafe, defaultUpdateFields } from "../utils/formHelpers";

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

    const updatedForm = await prisma.form.update({
      where: { token },
      data: {
        ...defaultUpdateFields(),
        bdi_score: combinedScore,
      },
    });

    res.json({ success: true, form: mapFormSafe(updatedForm) });
  } catch (error) {
    console.error("Error submitting Becks form:", error);
    res
      .status(500)
      .json({ error: "Failed to submit form", code: "SUBMIT_ERROR" });
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

    const updatedForm = await prisma.form.update({
      where: { token },
      data: {
        ...defaultUpdateFields(),
        bai_score: combinedScore,
      },
    });

    res.json({ success: true, form: mapFormSafe(updatedForm) });
  } catch (error) {
    console.error("Error submitting Burns form:", error);
    res
      .status(500)
      .json({ error: "Failed to submit form", code: "SUBMIT_ERROR" });
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
    return res
      .status(400)
      .json({ error: "Missing required fields", code: "MISSING_FIELDS" });
  }

  try {
    const form = await validateTokenOrFail(token, res);
    if (!form) return;

    const dataUpdate: Record<string, unknown> = { ...defaultUpdateFields() };

    for (const schema of YSQ_SCHEMAS) {
      const key = `ysq_${schema}_answers` as keyof typeof scores;
      const answers = scores[key];
      if (!answers || !Array.isArray(answers)) continue;

      const numericAnswers = answers.map((v) => Number(v) || 0);
      const rawScore = numericAnswers.reduce((sum, val) => sum + val, 0);
      const rawCategory = getScoreCategory(
        schema.toUpperCase() as SchemaType,
        rawScore
      );
      dataUpdate[`ysq_${schema}_score`] = `${rawScore}-${rawCategory}`;

      const score456 = numericAnswers
        .filter((val) => val >= 4 && val <= 6)
        .reduce((sum, val) => sum + val, 0);
      const score456Category = getScoreCategory(
        schema.toUpperCase() as SchemaType,
        score456
      );
      dataUpdate[`ysq_${schema}_456`] = `${score456}-${score456Category}`;
    }

    const updatedForm = await prisma.form.update({
      where: { token },
      data: dataUpdate,
    });
    res.json({ success: true, form: mapFormSafe(updatedForm) });
  } catch (error) {
    console.error("Error submitting YSQ form:", error);
    res
      .status(500)
      .json({ error: "Failed to submit YSQ form", code: "SUBMIT_ERROR" });
  }
};

export const submitSMIForm = async (
  req: Request<
    {},
    unknown,
    { token: string; results: Record<string, { average: number }> }
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

    const dataUpdate: Record<string, unknown> = { ...defaultUpdateFields() };

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

    const updatedForm = await prisma.form.update({
      where: { token },
      data: dataUpdate,
    });
    res.json({ success: true, form: mapFormSafe(updatedForm) });
  } catch (error) {
    console.error("Error submitting SMI form:", error);
    res
      .status(500)
      .json({ error: "Failed to submit SMI form", code: "SUBMIT_ERROR" });
  }
};
