"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AdminDialogVariant = "danger" | "default";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AdminDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const confirmClass =
    variant === "danger"
      ? "rounded-lg border border-red-700 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-lg border border-[var(--icai-navy)] bg-[var(--icai-navy)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--icai-navy-light)] disabled:cursor-not-allowed disabled:opacity-60";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b1f3a]/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-bold text-[var(--icai-navy)]">
          {title}
        </h2>
        <p id={descId} className="mt-3 text-sm leading-relaxed text-slate-600">
          {message}
        </p>
        <div className="mt-6 flex flex-row flex-wrap items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            className="inline-flex min-w-[5.5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            className={`inline-flex min-w-[5.5rem] items-center justify-center ${confirmClass}`}
            onClick={onConfirm}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
