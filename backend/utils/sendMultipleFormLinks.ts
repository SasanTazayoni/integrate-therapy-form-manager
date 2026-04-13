import { Resend } from "resend";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";
import { Form } from "@prisma/client";
import { FORM_TITLES } from "../data/formTypes";
import { THERAPIST_SIGNATURE } from "./therapistSignature";

const baseUrl = getFrontendBaseUrl();
const resend = new Resend(getEnvVar("RESEND_API_KEY"));

export type SendMultipleFormLinksParams = {
  email: string;
  clientName?: string;
  forms: Form[];
};

export async function sendMultipleFormLinks({
  email,
  clientName,
  forms,
}: SendMultipleFormLinksParams): Promise<void> {
  if (forms.length === 0) return;

  const nameToUse = clientName ?? "Sir/Madam";
  const htmlLinks = forms
    .map(
      (f) =>
        `<p><strong>${FORM_TITLES[f.form_type as keyof typeof FORM_TITLES]}</strong>: <a href="${baseUrl}/${
          f.form_type
        }/${f.token}">Click here to complete</a></p>`
    )
    .join("");

  const htmlBody = `
    <p>Dear ${nameToUse},</p>
    <p>You have been sent the following forms to complete:</p>
    ${htmlLinks}
    ${THERAPIST_SIGNATURE}
  `;

  const { error } = await resend.emails.send({
    from: getEnvVar("FROM_EMAIL"),
    to: email,
    subject: `Your forms from Integrate Therapy`,
    html: htmlBody,
  });

  if (error) {
    throw new Error("Email delivery failed", { cause: error });
  }
}
