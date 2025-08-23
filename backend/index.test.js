import { describe, test, expect, vi } from "vitest";
import request from "supertest";
import app from "../backend/index";

vi.mock("../backend/utils/getFrontendBaseUrl", () => ({
  getFrontendBaseUrl: () => "http://localhost:5173",
}));

describe("Express App", () => {
  test("should respond with 404 for unknown /clients routes", async () => {
    const res = await request(app).get("/clients/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });

  test("should respond with 404 for unknown /forms routes", async () => {
    const res = await request(app).get("/forms/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });

  test("should include CORS and Helmet headers", async () => {
    const res = await request(app).get("/clients/nonexistent");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(res.headers).toHaveProperty("x-dns-prefetch-control", "off");
    expect(res.headers).toHaveProperty("access-control-allow-origin");
  });
});
