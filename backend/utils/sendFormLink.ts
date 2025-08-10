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

const formTitles: Record<string, string> = {
  YSQ: "Young Schema Questionnaire (YSQ) Form",
  SMI: "Schema Mode Inventory (SMI) Form",
  BECKS: "Beck's Depression Inventory (BDI) Form",
  BURNS: "Burn's Anxiety Inventory (BAI) Form",
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

  const formTitle = formTitles[formType] ?? `${formType} Form`;
  const link = `${baseUrl}${formPath}/${token}`;
  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();
  const logoUrl = `${baseUrl}/logo.png`;

  const mailOptions = {
    from: fromEmail,
    to,
    subject: `Your ${formTitle}`,
    html: `
      <p>Dear ${nameToUse},</p>
      <p>You have been sent a <strong>${formTitle}</strong> to complete.</p>
      <p><a href="${link}">Click here to complete your form</a></p>
      <p>This link will expire in 2 weeks.</p>

      <p><em>Please note: This is an automated message, and replies to this email are not monitored.</em></p>

      <br />

      <p>Best wishes,</p>
      <p>Simon Burgess Dip MBACP</p>
      <p>Integrate Therapy<br />
      The Foundry Building<br />
      2 Smiths Square<br />
      77 Fulham Palace Road<br />
      London<br />
      W6 8AF</p>
      <p>Tel: 0784 604 3703<br />
      Email: info@integratetherapy.co.uk</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Failed to send email:", error.message);
    } else {
      console.error("❌ Failed to send email:", error);
    }
    throw new Error("Email sending failed");
  }
}
