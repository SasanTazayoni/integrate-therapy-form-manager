import { describe, test, expect } from "vitest";
import pool from "./db";

describe("Database connection", () => {
  test("should connect and return current time", async () => {
    const result = await pool.query("SELECT NOW()");
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty("now");
  });
});
