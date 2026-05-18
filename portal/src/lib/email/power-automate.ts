import type { EmailProvider, SendOtpEmailParams } from "./types";

/**
 * Demo integration: Microsoft Power Automate HTTP trigger → Outlook.
 * Production should swap to ICAI email kit, Microsoft Graph, SMTP, or a transactional provider
 * via EMAIL_PROVIDER and a new provider class implementing EmailProvider.
 */
export class PowerAutomateEmailProvider implements EmailProvider {
  readonly name = "power_automate";

  async sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
    const webhookUrl = process.env.POWER_AUTOMATE_OTP_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("POWER_AUTOMATE_OTP_WEBHOOK_URL is not configured");
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: params.to,
        subject: "ICAI Publications — Your sign-in code",
        otp: params.otp,
        expiresInMinutes: params.expiresInMinutes,
        body: `Your ICAI Publications verification code is ${params.otp}. It expires in ${params.expiresInMinutes} minutes.`,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Power Automate webhook failed (${response.status}): ${text}`,
      );
    }
  }
}
