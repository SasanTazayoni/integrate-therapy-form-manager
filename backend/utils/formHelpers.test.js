import { describe, test, expect } from "vitest";
import {
  getLatestForm,
  getActiveForms,
  getInactiveForms,
  mapFormSafe,
  defaultUpdateFields,
} from "./formHelpers";

const formsMock = [
  {
    token: "t1",
    form_type: "YSQ",
    is_active: true,
    submitted_at: new Date("2025-08-01T10:00:00Z"),
  },
  {
    token: "t2",
    form_type: "BDI",
    is_active: false,
    submitted_at: new Date("2025-08-05T10:00:00Z"),
  },
  {
    token: "t3",
    form_type: "YSQ",
    is_active: true,
    submitted_at: new Date("2025-08-10T10:00:00Z"),
  },
];

describe("formHelpers", () => {
  describe("getLatestForm", () => {
    test("returns the latest form matching filter", () => {
      const latest = getLatestForm(formsMock, (f) => f.form_type === "YSQ");
      expect(latest.token).toBe("t3");
    });

    test("returns undefined if no forms match filter", () => {
      const latest = getLatestForm(
        formsMock,
        (f) => f.form_type === "NonExistent"
      );
      expect(latest).toBeUndefined();
    });

    test("returns latest form even when some submitted_at are missing", () => {
      const forms = [
        { token: "t1", submitted_at: null, form_type: "YSQ" },
        {
          token: "t2",
          submitted_at: new Date("2025-08-05T10:00:00Z"),
          form_type: "YSQ",
        },
        { token: "t3", submitted_at: undefined, form_type: "YSQ" },
      ];
      const latest = getLatestForm(forms, (f) => f.form_type === "YSQ");
      expect(latest.token).toBe("t2");
    });
  });

  describe("getActiveForms", () => {
    test("returns only active forms", () => {
      const active = getActiveForms(formsMock);
      expect(active.length).toBe(2);
      expect(active.every((f) => f.is_active)).toBe(true);
    });

    test("filters by form type if provided", () => {
      const activeYSQ = getActiveForms(formsMock, "YSQ");
      expect(activeYSQ.length).toBe(2);
      expect(activeYSQ.every((f) => f.form_type === "YSQ")).toBe(true);

      const activeBDI = getActiveForms(formsMock, "BDI");
      expect(activeBDI.length).toBe(0);
    });
  });

  describe("getInactiveForms", () => {
    test("returns only inactive forms", () => {
      const inactive = getInactiveForms(formsMock);
      expect(inactive.length).toBe(1);
      expect(inactive[0].token).toBe("t2");
    });
  });

  describe("mapFormSafe", () => {
    test("maps a form correctly", () => {
      const mapped = mapFormSafe(formsMock[0]);
      expect(mapped).toEqual({
        token: "t1",
        formType: "YSQ",
        submittedAt: formsMock[0].submitted_at,
        isActive: true,
      });
    });

    test("returns defaults for null/undefined form", () => {
      const mappedNull = mapFormSafe(null);
      expect(mappedNull).toEqual({
        token: null,
        formType: null,
        submittedAt: null,
        isActive: false,
      });
      const mappedUndefined = mapFormSafe(undefined);
      expect(mappedUndefined).toEqual(mappedNull);
    });
  });

  describe("defaultUpdateFields", () => {
    test("returns fields with current date and defaults", () => {
      const fields = defaultUpdateFields();
      expect(fields).toHaveProperty("submitted_at");
      expect(fields).toHaveProperty("is_active", false);
      expect(fields).toHaveProperty("token_expires_at");
      expect(fields.submitted_at).toBeInstanceOf(Date);
      expect(fields.token_expires_at).toBeInstanceOf(Date);
    });
  });
});
