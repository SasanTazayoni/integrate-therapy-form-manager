import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

dotenv.config();

const baseUrl = getFrontendBaseUrl();

function getFromEmail() {
  return getEnvVar("FROM_EMAIL");
}

const transporter = nodemailer.createTransport({
  host: getEnvVar("SMTP_HOST"),
  port: Number(getEnvVar("SMTP_PORT")),
  secure: getEnvVar("SMTP_SECURE") === "true",
  auth: {
    user: getEnvVar("SMTP_USER"),
    pass: getEnvVar("SMTP_PASS"),
  },
});

const pathMap: Record<string, string> = {
  YSQ: "/YSQ",
  SMI: "/SMI",
  BECKS: "/BECKS",
  BURNS: "/BURNS",
};

export async function sendFormLink({
  to,
  token,
  formType,
  clientName,
}: {
  to: string;
  token: string;
  formType: string;
  clientName?: string;
}) {
  const formPath = pathMap[formType];
  if (!formPath) {
    throw new Error(`Invalid form type: ${formType}`);
  }

  const link = `${baseUrl}${formPath}/${token}`;
  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();

  const mailOptions = {
    from: fromEmail,
    to,
    subject: `Your ${formType} Form`,
    html: `
      <p>Hi ${nameToUse},</p>
      <p>You’ve been sent a <strong>${formType}</strong> form to complete.</p>
      <p><a href="${link}">Click here to complete your form</a></p>
      <p>This link will expire in 2 weeks.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message || error);
    throw new Error("Email sending failed");
  }
}
