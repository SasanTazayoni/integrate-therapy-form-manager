import prisma from "../prisma/client";
import { normalizeEmail } from "./normalizeEmail";

export async function findClientByEmail(email: string) {
  return prisma.client.findUnique({
    where: { email: normalizeEmail(email) },
  });
}
