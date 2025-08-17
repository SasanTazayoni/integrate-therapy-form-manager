import cron from "node-cron";
import { deleteInactiveClientsOlderThanOneYear } from "./deleteInactiveClients";

const CRON_ENABLED = process.env.CRON_ENABLED !== "false";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 0 1 * *";

if (CRON_ENABLED) {
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[cron] Running inactive-client cleanup (${CRON_SCHEDULE})...`);
    try {
      await deleteInactiveClientsOlderThanOneYear();
    } catch (err) {
      console.error("[cron] Cleanup failed:", err);
    }
  });

  console.log(`[cron] Scheduled inactive-client cleanup: ${CRON_SCHEDULE}`);
}

export async function runCleanupOnce(): Promise<void> {
  console.log("[cron] Manual cleanup run triggered...");
  try {
    await deleteInactiveClientsOlderThanOneYear();
  } catch (err) {
    console.error("[cron] Manual cleanup failed:", err);
  }
}
