import { describe, test, expect, vi } from "vitest";
import { validateRequestBodyFields } from "./validationUtils";
import type { Request, Response } from "express";

describe("validateRequestBodyFields", () => {
  test("returns valid true when all required fields are present", () => {
    const req = { body: { name: "Alice", age: 30 } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: true });
    expect(vi.mocked(res.status)).not.toHaveBeenCalled();
    expect(vi.mocked(res.json)).not.toHaveBeenCalled();
  });

  test("returns invalid when a required field is missing", () => {
    const req = { body: { name: "Alice" } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "age" });
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(400);
    expect(vi.mocked(res.json)).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "age",
    });
  });

  test("returns invalid when a field is undefined", () => {
    const req = { body: { name: undefined, age: 30 } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "name" });
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(400);
    expect(vi.mocked(res.json)).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "name",
    });
  });

  test("returns invalid when a field is null", () => {
    const req = { body: { name: null, age: 30 } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "name" });
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(400);
    expect(vi.mocked(res.json)).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "name",
    });
  });

  test("returns valid if no required fields are provided", () => {
    const req = { body: { foo: "bar" } } as unknown as Request;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;

    const result = validateRequestBodyFields(req, res, []);

    expect(result).toEqual({ valid: true });
    expect(vi.mocked(res.status)).not.toHaveBeenCalled();
    expect(vi.mocked(res.json)).not.toHaveBeenCalled();
  });
});
