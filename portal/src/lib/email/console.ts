import type { EmailProvider, SendOtpEmailParams } from "./types";

/** Local/demo fallback when no production email gateway is configured. */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
    console.info(
      `[ICAI Email Demo] OTP for ${params.to}: ${params.otp} (expires in ${params.expiresInMinutes}m)`,
    );
  }
}
