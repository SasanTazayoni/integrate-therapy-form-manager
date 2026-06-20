import prisma from "../prisma/client";

export const deleteClientByEmail = async (email: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new Error(`No client found with email: ${email}`);
    }

    const deletedClient = await prisma.client.delete({
      where: { id: client.id },
    });

    return deletedClient;
  } catch (error) {
    console.error("deleteClientByEmail failed:", error);
    throw new Error("Failed to delete client and forms", { cause: error });
  }
};
