import { describe, test, expect, vi, beforeEach } from "vitest";
import { getClientFormsStatus } from "./clientsController";
import * as PrismaModule from "../prisma/client";

vi.mock("../prisma/client", () => ({
  __esModule: true,
  default: {
    client: {
      findUnique: vi.fn(),
    },
    token: {
      findMany: vi.fn(),
    },
  },
}));

const prisma = PrismaModule.default;

describe("clientsController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  test("getClientFormsStatus > returns 400 if email is missing", async () => {
    await getClientFormsStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email query param is required",
    });
  });

  test("getClientFormsStatus > returns exists=false if client not found", async () => {
    req.query.email = "nonexistent@example.com";
    prisma.client.findUnique.mockResolvedValue(null);

    await getClientFormsStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      exists: false,
      forms: {
        YSQ: { activeToken: false, submitted: false },
        SMI: { activeToken: false, submitted: false },
        BECKS: { activeToken: false, submitted: false },
        BURNS: { activeToken: false, submitted: false },
      },
    });
  });
});
