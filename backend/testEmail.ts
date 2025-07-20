import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

resend.emails
  .send({
    from: process.env.FROM_EMAIL!,
    to: "integrate.therapy.forms@gmail.com",
    subject: "Hello World from Resend",
    html: "<p>Congrats on sending your <strong>first email</strong> via Node!</p>",
  })
  .then(console.log)
  .catch(console.error);
