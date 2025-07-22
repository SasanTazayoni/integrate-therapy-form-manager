import { Resend } from "resend";
import { getEnvVar } from "../utils/requiredEnv";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(getEnvVar("RESEND_API_KEY"));

async function testSend() {
  try {
    const result = await resend.emails.send({
      from: getEnvVar("FROM_EMAIL_TEST"),
      to: "integrate.therapy.forms@gmail.com",
      subject: "Hello World from Resend",
      html: "<p>Congrats on sending your <strong>first email</strong> via Node!</p>",
    });
    console.log("✅ Email sent:", result);
  } catch (error: any) {
    console.error("❌ Failed to send test email:", error.message || error);
  }
}

testSend();
