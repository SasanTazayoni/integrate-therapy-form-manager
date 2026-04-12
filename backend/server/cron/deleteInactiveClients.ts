import prisma from "../../prisma/client";
import { deleteClientByEmail } from "../../controllers/clientDeletion";
import { CLIENT_STATUS } from "../../data/clientStatus";

export async function deleteInactiveClientsOlderThanOneYear(): Promise<void> {
  try {
    const now = new Date();

    const expiredClients = await prisma.client.findMany({
      where: {
        status: CLIENT_STATUS.INACTIVE,
        delete_inactive: { lte: now },
      },
      select: { email: true },
    });

    for (const client of expiredClients) {
      try {
        await deleteClientByEmail(client.email);
      } catch (error) {
        console.error(
          `[cleanup] Failed to delete client ${client.email}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("[cleanup] Failed to scan for inactive clients:", err);
  }
}
