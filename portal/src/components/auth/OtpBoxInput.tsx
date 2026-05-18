"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LENGTH = 6;

type OtpBoxInputProps = {
  length?: number;
  disabled?: boolean;
  error?: boolean;
  onChange: (code: string) => void;
  onComplete: (code: string) => void;
};

export function OtpBoxInput({
  length = DEFAULT_LENGTH,
  disabled = false,
  error = false,
  onChange,
  onComplete,
}: OtpBoxInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const sync = useCallback(
    (next: string[]) => {
      setDigits(next);
      const code = next.join("");
      onChange(code);
      if (code.length === length && next.every((d) => d !== "")) {
        onComplete(code);
      }
    },
    [length, onChange, onComplete],
  );

  useEffect(() => {
    if (!error) return;
    sync(Array(length).fill(""));
    inputsRef.current[0]?.focus();
  }, [error, length, sync]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    sync(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    sync(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      onPaste={handlePaste}
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e.key)}
          className={`h-12 w-10 rounded-lg border-2 text-center text-lg font-semibold tracking-widest outline-none transition sm:h-14 sm:w-12 ${
            error
              ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 bg-white text-[var(--icai-navy)] focus:border-[var(--icai-gold)] focus:ring-2 focus:ring-[var(--icai-gold-soft)]"
          } disabled:opacity-60`}
        />
      ))}
    </div>
  );
}
