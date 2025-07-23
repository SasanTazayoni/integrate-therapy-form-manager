import { Resend } from "resend";
import dotenv from "dotenv";
import { getEnvVar } from "./requiredEnv";

dotenv.config();

const resend = new Resend(getEnvVar("RESEND_API_KEY"));
const baseUrl = getEnvVar("FRONTEND_BASE_URL").replace(/\/$/, "");

function getFromEmail() {
  if (process.env.NODE_ENV === "production") {
    return getEnvVar("FROM_EMAIL_PROD");
  } else {
    return getEnvVar("FROM_EMAIL_TEST");
  }
}

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

  const email = {
    from: fromEmail,
    to,
    subject: `Your ${formType} Form`,
    html: `
      <p>Hi ${nameToUse},</p>
      <p>You’ve been sent a <strong>${formType}</strong> form to complete.</p>
      <p><a href="${link}">Click here to complete your form</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    const result = await resend.emails.send(email);
    console.log("✅ Resend email sent successfully:", result);
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message || error);
    throw new Error("Email sending failed");
  }
}
