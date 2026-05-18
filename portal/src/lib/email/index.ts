import { ConsoleEmailProvider } from "./console";
import { PowerAutomateEmailProvider } from "./power-automate";
import type { EmailProvider, SendOtpEmailParams } from "./types";

export type { EmailProvider, SendOtpEmailParams };

/**
 * Pluggable email gateway. Demo uses Power Automate (Outlook) or console logging.
 * Production: set EMAIL_PROVIDER and implement ICAI kit / Graph / SMTP providers here.
 */
export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();

  switch (provider) {
    case "power_automate":
      return new PowerAutomateEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}

export async function sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
  const emailProvider = getEmailProvider();
  await emailProvider.sendOtpEmail(params);
}
