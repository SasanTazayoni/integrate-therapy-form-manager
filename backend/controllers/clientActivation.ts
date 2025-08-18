import prisma from "../prisma/client";
import type { Client as PrismaClientType } from "@prisma/client";

export type DeactivateClientResult =
  | { ok: true; data: PrismaClientType }
  | { ok: false; data: { error: string } };

export async function deactivateClient(
  email: string
): Promise<DeactivateClientResult> {
  try {
    const now = new Date();
    const deleteInactiveDate = new Date(now);
    deleteInactiveDate.setFullYear(deleteInactiveDate.getFullYear() + 1);

    const client = await prisma.client.update({
      where: { email },
      data: {
        status: "inactive",
        inactivated_at: now,
        delete_inactive: deleteInactiveDate,
      },
    });

    return { ok: true, data: client };
  } catch (error) {
    console.error("Error deactivating client:", error);
    return { ok: false, data: { error: "Failed to deactivate client" } };
  }
}

export type ActivateClientResult =
  | { ok: true; data: PrismaClientType }
  | { ok: false; data: { error: string } };

export async function activateClient(
  email: string
): Promise<ActivateClientResult> {
  try {
    const client = await prisma.client.update({
      where: { email },
      data: {
        status: "active",
        inactivated_at: null,
        delete_inactive: null,
      },
    });

    return { ok: true, data: client };
  } catch (error) {
    console.error("Error activating client:", error);
    return { ok: false, data: { error: "Failed to activate client" } };
  }
}
