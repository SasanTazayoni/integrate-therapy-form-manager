export async function sendEmailToClient(
  email: string,
  { subject, body }: { subject: string; body: string }
) {
  console.log(`📧 Sending email to: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // You can plug in Resend, Nodemailer, etc., here later
}
