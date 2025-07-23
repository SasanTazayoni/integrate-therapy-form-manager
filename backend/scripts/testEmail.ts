import { getEnvVar } from "../utils/requiredEnv";
import { sendFormLink } from "../utils/sendFormLink";
import dotenv from "dotenv";

dotenv.config();

async function testSend() {
  try {
    await sendFormLink({
      to: "sasantazayoni@gmail.com",
      token: "testtoken123",
      formType: "YSQ",
      clientName: "Test Client",
    });
    console.log("✅ Test email sent successfully");
  } catch (error: any) {
    console.error("❌ Failed to send test email:", error.message || error);
  }
}

testSend();
