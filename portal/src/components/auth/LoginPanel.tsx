"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { OtpBoxInput } from "@/components/auth/OtpBoxInput";

type Tab = "otp" | "member" | "admin";
type OtpPhase = "email" | "code" | "name";

export function LoginPanel({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [tab, setTab] = useState<Tab>("otp");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpPhase, setOtpPhase] = useState<OtpPhase>("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInputKey, setOtpInputKey] = useState(0);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"info" | "error">("info");
  const [loading, setLoading] = useState(false);

  function resetOtpStep() {
    setOtpInputKey((k) => k + 1);
  }

  function changeEmail() {
    setOtpSent(false);
    setOtpPhase("email");
    setFullName("");
    setMessage(null);
    resetOtpStep();
  }

  async function sendOtpCode(targetEmail: string) {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessageTone("error");
      setMessage(data.error ?? "Unable to send verification code.");
      return false;
    }
    setOtpSent(true);
    setOtpPhase("code");
    setMessageTone("info");
    setMessage(`A verification code was sent to ${targetEmail.trim().toLowerCase()}.`);
    resetOtpStep();
    return true;
  }

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    await sendOtpCode(email);
  }

  const verifyOtp = useCallback(
    async (code: string) => {
      if (loading || code.length !== 6) return;
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessageTone("error");
        setMessage(data.error ?? "Invalid verification code.");
        setOtpInputKey((k) => k + 1);
        return;
      }
      if (data.needsName) {
        setOtpPhase("name");
        setMessageTone("info");
        setMessage("Welcome! Please enter your name to finish signing in.");
        return;
      }
      router.push(redirect);
      router.refresh();
    },
    [email, loading, redirect, router],
  );

  async function completeProfile(e: FormEvent) {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setMessageTone("error");
      setMessage("Please enter your full name.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/otp/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, fullName: trimmed }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessageTone("error");
      setMessage(data.error ?? "Could not save your name.");
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function passwordLogin(endpoint: string) {
    setLoading(true);
    setMessage(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessageTone("error");
      setMessage(data.error ?? "Login failed");
      return;
    }
    router.push(endpoint.includes("admin") ? "/admin" : redirect);
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "otp", label: "Non-member (OTP)" },
    { id: "member", label: "ICAI Member" },
    { id: "admin", label: "Administrator" },
  ];

  return (
    <section className={`icai-card rounded-lg p-6 ${className}`}>
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setMessage(null);
              if (t.id !== "otp") {
                setOtpPhase("email");
                setOtpSent(false);
                setFullName("");
              }
            }}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-[var(--icai-navy)] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {message && (
        <p
          className={`mb-4 rounded px-3 py-2 text-sm ${
            messageTone === "error"
              ? "border border-red-200 bg-red-50 text-red-800"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {message}
        </p>
      )}

      {tab === "otp" && otpPhase === "email" && (
        <form onSubmit={requestOtp} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="you@example.com"
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="icai-btn-primary w-full rounded px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send verification code"}
          </button>
          <p className="text-xs text-slate-500">
            A one-time code will be sent to your email address.
          </p>
        </form>
      )}

      {tab === "otp" && otpPhase === "code" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-600">Code sent to</p>
            <p className="font-medium text-[var(--icai-navy)]">{email.trim().toLowerCase()}</p>
          </div>

          <div>
            <p className="mb-3 text-center text-sm font-medium text-slate-700">
              Enter 6-digit verification code
            </p>
            <OtpBoxInput
              key={otpInputKey}
              disabled={loading}
              error={messageTone === "error"}
              onChange={() => {
                if (messageTone === "error") {
                  setMessage(null);
                  setMessageTone("info");
                }
              }}
              onComplete={verifyOtp}
            />
            {loading && (
              <p className="mt-3 text-center text-sm text-slate-500">Verifying…</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => sendOtpCode(email)}
              className="rounded border border-[var(--icai-navy)] px-4 py-2 text-sm font-medium text-[var(--icai-navy)] hover:bg-slate-50 disabled:opacity-60"
            >
              Resend code
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={changeEmail}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Change email
            </button>
          </div>

          {messageTone === "error" && (
            <p className="text-center text-xs text-slate-500">
              Wrong code or code expired? Use <strong>Resend code</strong> or{" "}
              <strong>Change email</strong> above.
            </p>
          )}
        </div>
      )}

      {tab === "otp" && otpPhase === "name" && (
        <form onSubmit={completeProfile} className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-600">Signing in as</p>
            <p className="font-medium text-[var(--icai-navy)]">{email.trim().toLowerCase()}</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Your full name
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="e.g. Priya Sharma"
              autoFocus
              autoComplete="name"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="icai-btn-primary w-full rounded px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving…" : "Continue to publications"}
          </button>
          <p className="text-xs text-slate-500">
            We use your name for access records and admin reporting. You only need to enter it once.
          </p>
        </form>
      )}

      {tab === "member" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordLogin("/api/auth/member/login");
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700">
            Member email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@icai.org"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="icai-btn-primary w-full rounded px-4 py-2 text-sm font-semibold"
          >
            Sign in as member
          </button>
          <p className="text-xs text-slate-500">
            Demonstration sign-in for ICAI members. Production will use the ICAI
            Self-Service Portal single sign-on.
          </p>
        </form>
      )}

      {tab === "admin" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordLogin("/api/auth/admin/login");
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700">
            Admin email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@icai.org"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="icai-btn-primary w-full rounded px-4 py-2 text-sm font-semibold"
          >
            Admin sign in
          </button>
        </form>
      )}
    </section>
  );
}
