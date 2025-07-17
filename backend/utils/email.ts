import nodemailer from "nodemailer";
import { createMagicLinkSendingError } from "../errors";

export async function sendMagicLinksEmail(
  email: string,
  magicLinks: { questionnaire: string; url: string }[]
) {
  // Create a transporter (configure with your SMTP service details)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Build the email content with magic links
  const htmlLinks = magicLinks
    .map(
      (link) =>
        `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.questionnaire}</a></li>`
    )
    .join("");

  const mailOptions = {
    from: `"Integrate Therapy" <${process.env.SMTP_USER}>`,
    to: email,
    replyTo: "info@integratetherapy.co.uk",
    subject: "Your Questionnaire Magic Links",
    html: `
      <p>Hi! Please use the following links to access your questionnaires:</p>
      <ul>${htmlLinks}</ul>
      <p>Links expire in 14 days.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send magic links email:", error);
    throw createMagicLinkSendingError(
      error instanceof Error ? error.message : undefined
    );
  }
}
