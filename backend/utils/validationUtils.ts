import { Request, Response } from "express";

export function validateRequestBodyFields(
  req: Request,
  res: Response,
  requiredFields: (keyof any)[]
): { valid: boolean; missingField?: string } {
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
      return { valid: false, missingField: String(field) };
    }
  }
  return { valid: true };
}
