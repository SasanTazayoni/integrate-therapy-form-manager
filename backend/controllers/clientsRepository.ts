import prisma from "../prisma/client";
import { FormType } from "../utils/formTypes";

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

export type Form = {
  id: string;
  clientId: string;
  form_type: FormType | string;
  token: string;
  token_sent_at: Date;
  token_expires_at: Date;
  is_active: boolean;
  submitted_at: Date | null;
  revoked_at: Date | null;
  total_score?: number | null;
  created_at: Date;
  updated_at: Date;
};

export const findClientByEmail = async (
  email: string
): Promise<Client | null> => {
  return prisma.client.findUnique({ where: { email } });
};

export const getFormsByClientId = async (clientId: string): Promise<Form[]> => {
  return prisma.form.findMany({ where: { clientId } });
};

export const createNewClient = async (data: {
  email: string;
  name?: string | null;
  dob?: Date | null;
}): Promise<Client> => {
  return prisma.client.create({ data });
};
