import { Request, Response } from "express";

export function validateRequestBodyFields<T extends Record<string, unknown>>(
  req: Request<{}, {}, T>,
  res: Response,
  requiredFields: (keyof T)[]
): { valid: boolean; missingField?: keyof T } {
  for (const field of requiredFields) {
    if (
      !(field in req.body) ||
      req.body[field] === undefined ||
      req.body[field] === null
    ) {
      res.status(400).json({
        error: "Missing required fields",
        code: "MISSING_FIELDS",
        missingField: field,
      });
      return { valid: false, missingField: field };
    }
  }
  return { valid: true };
}
