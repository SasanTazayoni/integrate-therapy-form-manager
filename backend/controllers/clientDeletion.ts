import prisma from "../prisma/client";

export const deleteClientByEmail = async (email: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new Error(`No client found with email: ${email}`);
    }

    const deletedClient = await prisma.$transaction(async (transaction) => {
      await transaction.form.updateMany({
        where: {
          clientId: client.id,
          is_active: true,
        },
        data: {
          is_active: false,
          revoked_at: new Date(),
        },
      });

      await transaction.form.deleteMany({
        where: { clientId: client.id },
      });

      const deleted = await transaction.client.delete({
        where: { id: client.id },
      });

      return deleted;
    });

    return deletedClient;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Failed to delete client and forms");
  }
};
