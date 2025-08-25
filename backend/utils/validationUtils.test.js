import { describe, test, expect, vi } from "vitest";
import { validateRequestBodyFields } from "./validationUtils";

describe("validateRequestBodyFields", () => {
  test("returns valid true when all required fields are present", () => {
    const req = { body: { name: "Alice", age: 30 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: true });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("returns invalid when a required field is missing", () => {
    const req = { body: { name: "Alice" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "age" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "age",
    });
  });

  test("returns invalid when a field is undefined", () => {
    const req = { body: { name: undefined, age: 30 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "name" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "name",
    });
  });

  test("returns invalid when a field is null", () => {
    const req = { body: { name: null, age: 30 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    const result = validateRequestBodyFields(req, res, ["name", "age"]);

    expect(result).toEqual({ valid: false, missingField: "name" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
      code: "MISSING_FIELDS",
      missingField: "name",
    });
  });

  test("returns valid if no required fields are provided", () => {
    const req = { body: { foo: "bar" } };
    const res = { status: vi.fn(), json: vi.fn() };

    const result = validateRequestBodyFields(req, res, []);

    expect(result).toEqual({ valid: true });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
