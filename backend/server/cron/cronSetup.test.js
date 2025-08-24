import { describe, test, vi, beforeEach, expect } from "vitest";

vi.mock("./deleteInactiveClients", () => ({
  deleteInactiveClientsOlderThanOneYear: vi.fn(),
}));

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  },
}));

describe("cron callback execution", () => {
  let cleanupModule;
  let cron;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.CRON_ENABLED = "true";
    vi.resetModules();

    cleanupModule = await import("./deleteInactiveClients");
    cron = (await import("node-cron")).default;
  });

  test("should run the cleanup inside cron.schedule", async () => {
    let scheduledFn = null;

    cron.schedule.mockImplementation((schedule, fn) => {
      scheduledFn = fn;
      return { start: vi.fn() };
    });

    await import("./cronSetup");

    expect(cron.schedule).toHaveBeenCalled();

    await scheduledFn();

    expect(
      cleanupModule.deleteInactiveClientsOlderThanOneYear
    ).toHaveBeenCalled();
  });

  test("should log error if cleanup fails", async () => {
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockRejectedValue(
      new Error("fail")
    );

    let scheduledFn = null;
    cron.schedule.mockImplementation((schedule, fn) => {
      scheduledFn = fn;
      return { start: vi.fn() };
    });

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await import("./cronSetup");

    await scheduledFn();

    expect(
      cleanupModule.deleteInactiveClientsOlderThanOneYear
    ).toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "[cron] Cleanup failed:",
      expect.any(Error)
    );

    consoleErrorMock.mockRestore();
  });
});

describe("runCleanupOnce", () => {
  let cleanupModule;
  let runCleanupOnce;

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanupModule = await import("./deleteInactiveClients");
    ({ runCleanupOnce } = await import("./cronSetup"));
  });

  test("should call deleteInactiveClientsOlderThanOneYear", async () => {
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockResolvedValue();

    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await runCleanupOnce();

    expect(
      cleanupModule.deleteInactiveClientsOlderThanOneYear
    ).toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledWith(
      "[cron] Manual cleanup run triggered..."
    );

    consoleLogMock.mockRestore();
  });

  test("should handle errors gracefully", async () => {
    const error = new Error("fail");
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockRejectedValue(
      error
    );

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await runCleanupOnce();

    expect(
      cleanupModule.deleteInactiveClientsOlderThanOneYear
    ).toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "[cron] Manual cleanup failed:",
      error
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      "[cron] Manual cleanup run triggered..."
    );

    consoleErrorMock.mockRestore();
    consoleLogMock.mockRestore();
  });
});
