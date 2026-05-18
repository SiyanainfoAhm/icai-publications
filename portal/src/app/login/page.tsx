import { LoginPanel } from "@/components/auth/LoginPanel";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Non-members use email OTP. Members and administrators use demo credentials
        (production: ICAI SSP SSO).
      </p>
      <LoginPanel className="mt-8" />
    </div>
  );
}
