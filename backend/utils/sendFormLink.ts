import nodemailer, { Transporter } from "nodemailer";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

const baseUrl: string = getFrontendBaseUrl();

function getFromEmail(): string {
  return getEnvVar("FROM_EMAIL");
}

const pathMap: Record<string, string> = {
  YSQ: "/YSQ",
  SMI: "/SMI",
  BECKS: "/BECKS",
  BURNS: "/BURNS",
};

const formTitles: Record<string, string> = {
  YSQ: "Young Schema Questionnaire (YSQ)",
  SMI: "Schema Mode Inventory (SMI)",
  BECKS: "Beck's Depression Inventory (BDI)",
  BURNS: "Burn's Anxiety Inventory (BAI)",
};

export type SendFormLinkParams = {
  to: string;
  token: string;
  formType: keyof typeof pathMap;
  clientName?: string;
};

export async function sendFormLink({
  to,
  token,
  formType,
  clientName,
}: SendFormLinkParams): Promise<void> {
  const transporter: Transporter = nodemailer.createTransport({
    host: getEnvVar("SMTP_HOST"),
    port: Number(getEnvVar("SMTP_PORT")),
    secure: getEnvVar("SMTP_SECURE") === "true",
    auth: {
      user: getEnvVar("SMTP_USER"),
      pass: getEnvVar("SMTP_PASS"),
    },
  });

  const formPath = pathMap[formType];
  if (!formPath) throw new Error(`Invalid form type: ${formType}`);

  const formTitle = formTitles[formType];
  const link = `${baseUrl}${formPath}/${token}`;
  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();

  const mailOptions: nodemailer.SendMailOptions = {
    from: fromEmail,
    to,
    subject: `Your ${formTitle}`,
    html: `
      <p>Dear ${nameToUse},</p>
      <p>You have been sent a <strong>${formTitle}</strong> to complete.</p>
      <p><a href="${link}">Click here to complete your form</a></p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error(
      "❌ Failed to send email:",
      error instanceof Error ? error.message : error
    );
    throw new Error("Email sending failed");
  }
}
