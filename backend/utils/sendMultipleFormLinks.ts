import nodemailer, { Transporter } from "nodemailer";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";
import { Form } from "@prisma/client";

const baseUrl = getFrontendBaseUrl();

const formTitles: Record<string, string> = {
  YSQ: "Young Schema Questionnaire (YSQ)",
  SMI: "Schema Mode Inventory (SMI)",
  BECKS: "Beck's Depression Inventory (BDI)",
  BURNS: "Burn's Anxiety Inventory (BAI)",
};

function getFromEmail(): string {
  return getEnvVar("FROM_EMAIL");
}

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

  const transporter: Transporter = nodemailer.createTransport({
    host: getEnvVar("SMTP_HOST"),
    port: Number(getEnvVar("SMTP_PORT")),
    secure: getEnvVar("SMTP_SECURE") === "true",
    auth: {
      user: getEnvVar("SMTP_USER"),
      pass: getEnvVar("SMTP_PASS"),
    },
  });

  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();

  const htmlLinks = forms
    .map(
      (f) =>
        `<p><strong>${formTitles[f.form_type]}</strong>: <a href="${baseUrl}/${
          f.form_type
        }/${f.token}">Click here to complete</a></p>`
    )
    .join("");

  const mailOptions: nodemailer.SendMailOptions = {
    from: fromEmail,
    to: email,
    subject: `Your forms from Integrate Therapy`,
    html: `
      <p>Dear ${nameToUse},</p>
      <p>You have been sent the following forms to complete:</p>
      ${htmlLinks}
      <p>Best wishes,</p>
      <p>
        Simon Burgess Dip MBACP<br/>
        Integrate Therapy<br/>
        The Foundry Building<br/>
        2 Smiths Square<br/>
        77 Fulham Palace Road<br/>
        London<br/>
        W6 8AF<br/>
        Tel: 0784 604 3703
      </p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent with multiple forms:", info.messageId);
  } catch (error) {
    console.error(
      "❌ Failed to send multiple forms email:",
      error instanceof Error ? error.message : error
    );
    throw new Error("Email sending failed");
  }
}
