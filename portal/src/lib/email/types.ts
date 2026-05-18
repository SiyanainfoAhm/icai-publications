export interface SendOtpEmailParams {
  to: string;
  otp: string;
  expiresInMinutes: number;
}

export interface EmailProvider {
  readonly name: string;
  sendOtpEmail(params: SendOtpEmailParams): Promise<void>;
}
