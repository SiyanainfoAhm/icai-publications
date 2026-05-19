"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionVariant = "publish" | "hide" | "archive";

const VARIANT_CLASS: Record<ActionVariant, string> = {
  publish: "icai-action-btn--publish",
  hide: "icai-action-btn--hide",
  archive: "icai-action-btn--archive",
};

interface AdminActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionVariant;
  loading?: boolean;
  children: ReactNode;
}

export function AdminActionButton({
  variant,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`icai-action-btn ${VARIANT_CLASS[variant]} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <span className="icai-action-btn-spinner" aria-hidden />
          <span className="sr-only">Updating…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
