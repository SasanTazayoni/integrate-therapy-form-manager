import { Resend } from "resend";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";
import { FORM_TITLES, type FormType } from "../data/formTypes";
import { THERAPIST_SIGNATURE } from "./therapistSignature";

const baseUrl = getFrontendBaseUrl();
const resend = new Resend(getEnvVar("RESEND_API_KEY"));

function getFromEmail(): string {
  return getEnvVar("FROM_EMAIL");
}

const pathMap: Record<string, string> = {
  YSQ: "/YSQ",
  SMI: "/SMI",
  BECKS: "/BECKS",
  BURNS: "/BURNS",
};


export type SendFormLinkParams = {
  to: string;
  token: string;
  formType: FormType;
  clientName?: string;
};

export async function sendFormLink({
  to,
  token,
  formType,
  clientName,
}: SendFormLinkParams): Promise<void> {
  const formPath = pathMap[formType];
  if (!formPath) throw new Error(`Invalid form type: ${formType}`);

  const formTitle = FORM_TITLES[formType];
  const link = `${baseUrl}${formPath}/${token}`;
  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();

  const htmlBody = `
    <p>Dear ${nameToUse},</p>
    <p>You have been sent a <strong>${formTitle}</strong> to complete.</p>
    <p><a href="${link}">Click here to complete your form</a></p>
    ${THERAPIST_SIGNATURE}
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Your ${formTitle}`,
    html: htmlBody,
  });

  if (error) {
    throw new Error("Email delivery failed", { cause: error });
  }
}
