import prisma from "../prisma/client";

export type Client = {
  id: string;
  email: string;
  name?: string | null;
  dob?: Date | null;
  status: string;
  inactivated_at?: Date | null;
  created_at: Date;
  updated_at: Date;
};

export const findClientByEmail = async (
  email: string
): Promise<Client | null> => {
  return prisma.client.findUnique({ where: { email } });
};

export const getFormsByClientId = async (clientId: string) => {
  return prisma.form.findMany({
    where: { clientId },
  });
};

export const createNewClient = async (data: {
  email: string;
  name?: string | null;
  dob?: Date | null;
}): Promise<Client> => {
  return prisma.client.create({ data });
};
