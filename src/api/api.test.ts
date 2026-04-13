import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { TOKEN_KEY } from "./authFrontend";

describe("api.ts baseURL", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  test("uses VITE_API_URL when defined", async () => {
    vi.stubEnv("VITE_API_URL", "https://example.com/api");
    const { default: api } = await import("./api");
    expect(api.defaults.baseURL).toBe("https://example.com/api");
  });

  test("falls back to '/' when VITE_API_URL is not set", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const { default: api } = await import("./api");
    expect(api.defaults.baseURL).toBe("/");
  });
});

type InterceptorFulfilled = (config: { headers: Record<string, string> }) => {
  headers: Record<string, string>;
};

function getInterceptor(api: unknown): InterceptorFulfilled {
  const handlers = (api as { interceptors: { request: { handlers: Array<{ fulfilled: InterceptorFulfilled }> } } })
    .interceptors.request.handlers;
  return handlers[0]!.fulfilled;
}

describe("api.ts request interceptor", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  test("adds Authorization header when token is in sessionStorage", async () => {
    sessionStorage.setItem(TOKEN_KEY, "test.jwt.token");
    const { default: api } = await import("./api");

    const fulfilled = getInterceptor(api);
    const config = fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer test.jwt.token");
  });

  test("does not add Authorization header when no token in sessionStorage", async () => {
    const { default: api } = await import("./api");

    const fulfilled = getInterceptor(api);
    const config = fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
