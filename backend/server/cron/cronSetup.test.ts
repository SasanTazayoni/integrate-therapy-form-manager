import { describe, test, vi, beforeEach, expect, type Mock } from "vitest";

vi.mock("./deleteInactiveClients", () => ({
  deleteInactiveClientsOlderThanOneYear: vi.fn(),
}));

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  },
}));

describe("cron callback execution", () => {
  let cleanupModule: { deleteInactiveClientsOlderThanOneYear: Mock };
  let cron: { schedule: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.CRON_ENABLED = "true";
    vi.resetModules();

    cleanupModule = await import("./deleteInactiveClients") as unknown as {
      deleteInactiveClientsOlderThanOneYear: Mock;
    };
    cron = ((await import("node-cron")).default) as unknown as { schedule: Mock };
  });

  test("should run the cleanup inside cron.schedule", async () => {
    let scheduledFn: (() => Promise<void>) | null = null;

    cron.schedule.mockImplementation((_schedule: string, fn: () => Promise<void>) => {
      scheduledFn = fn;
      return { start: vi.fn() };
    });

    await import("./cronSetup");

    expect(cron.schedule).toHaveBeenCalled();

    await scheduledFn!();

    expect(cleanupModule.deleteInactiveClientsOlderThanOneYear).toHaveBeenCalled();
  });

  test("should log error if cleanup fails", async () => {
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockRejectedValue(
      new Error("fail")
    );

    let scheduledFn: (() => Promise<void>) | null = null;
    cron.schedule.mockImplementation((_schedule: string, fn: () => Promise<void>) => {
      scheduledFn = fn;
      return { start: vi.fn() };
    });

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await import("./cronSetup");

      await scheduledFn!();

      expect(cleanupModule.deleteInactiveClientsOlderThanOneYear).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "[cron] Cleanup failed:",
        expect.any(Error)
      );
    } finally {
      consoleErrorMock.mockRestore();
    }
  });
});

describe("runCleanupOnce", () => {
  let cleanupModule: { deleteInactiveClientsOlderThanOneYear: Mock };
  let runCleanupOnce: () => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanupModule = await import("./deleteInactiveClients") as unknown as {
      deleteInactiveClientsOlderThanOneYear: Mock;
    };
    ({ runCleanupOnce } = await import("./cronSetup"));
  });

  test("should call deleteInactiveClientsOlderThanOneYear", async () => {
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockResolvedValue(undefined);

    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    try {
      await runCleanupOnce();

      expect(cleanupModule.deleteInactiveClientsOlderThanOneYear).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(
        "[cron] Manual cleanup run triggered..."
      );
    } finally {
      consoleLogMock.mockRestore();
    }
  });

  test("should handle errors gracefully", async () => {
    const error = new Error("fail");
    cleanupModule.deleteInactiveClientsOlderThanOneYear.mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    try {
      await runCleanupOnce();

      expect(cleanupModule.deleteInactiveClientsOlderThanOneYear).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "[cron] Manual cleanup failed:",
        error
      );
      expect(consoleLogMock).toHaveBeenCalledWith(
        "[cron] Manual cleanup run triggered..."
      );
    } finally {
      consoleErrorMock.mockRestore();
      consoleLogMock.mockRestore();
    }
  });
});
