"use client";

import { useEffect, useId, useRef } from "react";

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

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="admin-dialog-backdrop"
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
        className="admin-dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="admin-dialog-title">
          {title}
        </h2>
        <p id={descId} className="admin-dialog-message">
          {message}
        </p>
        <div className="admin-dialog-actions">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            className="admin-dialog-btn admin-dialog-btn--secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            className={`admin-dialog-btn ${
              variant === "danger" ? "admin-dialog-btn--danger" : "admin-dialog-btn--primary"
            }`}
            onClick={onConfirm}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
