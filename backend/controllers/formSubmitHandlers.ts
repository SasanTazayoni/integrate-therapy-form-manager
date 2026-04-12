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
import { YSQ_SCHEMAS, type YSQSchemaCode } from "../data/ysqSchemaCodes";

const submitScoreForm = (
  scoreField: "bdi_score" | "bai_score",
  categoryFn: (score: number) => string
) =>
  async (
    req: Request<{}, unknown, { token: string; result: string }>,
    res: Response
  ) => {
    const validation = validateRequestBodyFields(req, res, ["token", "result"]);
    if (!validation.valid) return;

    const { token, result } = req.body;

    try {
      const form = await validateTokenOrFail(token, res);
      if (!form) return;

      const combinedScore = parseAndCombineScore(result, categoryFn);

      const updatedForm = await prisma.form.update({
        where: { token },
        data: {
          ...defaultUpdateFields(),
          [scoreField]: combinedScore,
        },
      });

      res.json({ success: true, form: mapFormSafe(updatedForm) });
    } catch (error) {
      console.error(`Error submitting ${scoreField} form:`, error);
      res
        .status(500)
        .json({ error: "Failed to submit form", code: "SUBMIT_ERROR" });
    }
  };

export const submitBecksForm = submitScoreForm("bdi_score", getBecksScoreCategory);
export const submitBurnsForm = submitScoreForm("bai_score", getBurnsScoreCategory);

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

    for (const resultKey in results) {
      const avg = Number(results[resultKey]?.average);
      if (isNaN(avg)) {
        console.warn(
          `Invalid average for key ${resultKey}:`,
          results[resultKey]
        );
        continue;
      }

      let boundaryKey: string | undefined;
      if (resultKey.startsWith("smi_") && smiBoundaries[resultKey]) {
        boundaryKey = resultKey;
      } else {
        const normalized = normalizeLabel(resultKey);
        boundaryKey = labelToBoundaryKey[normalized];
      }

      if (!boundaryKey || !smiBoundaries[boundaryKey]) {
        console.warn(`No boundaries found for SMI key: ${resultKey}`);
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
