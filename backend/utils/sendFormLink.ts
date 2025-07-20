import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);
const baseUrl = "http://localhost:5173/integrate-therapy-form-manager";

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

  const email = {
    from: process.env.FROM_EMAIL!,
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
