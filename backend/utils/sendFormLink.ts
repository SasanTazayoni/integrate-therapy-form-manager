import { Resend } from "resend";
import { getEnvVar } from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

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
  const formPath = pathMap[formType];
  if (!formPath) throw new Error(`Invalid form type: ${formType}`);

  const formTitle = formTitles[formType];
  const link = `${baseUrl}${formPath}/${token}`;
  const nameToUse = clientName ?? "Sir/Madam";
  const fromEmail = getFromEmail();

  const htmlBody = `
    <p>Dear ${nameToUse},</p>
    <p>You have been sent a <strong>${formTitle}</strong> to complete.</p>
    <p><a href="${link}">Click here to complete your form</a></p>
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
  `;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your ${formTitle}`,
      html: htmlBody,
    });

    console.log("✅ Email sent:", result);
  } catch (error) {
    console.error(
      "❌ Failed to send email:",
      error instanceof Error ? error.message : error
    );
    throw new Error("Email sending failed");
  }
}
