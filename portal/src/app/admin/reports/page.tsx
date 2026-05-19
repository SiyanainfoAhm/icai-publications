"use client";

import { useState } from "react";

export default function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const exportHref = `/api/admin/analytics/export?from=${from}&to=${to}`;

  return (
    <>
      <h1 className="admin-page-title">Analytics &amp; reports</h1>
      <p className="admin-page-subtitle">
        Publication access by date range, committee, and user type. Export for reporting.
      </p>

      <div className="admin-toolbar mt-8">
        <label className="text-sm">
          <span className="mb-1 block font-medium">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="icai-field-input"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="icai-field-input"
          />
        </label>
        <a href={exportHref} className="icai-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
          Export access report (Excel)
        </a>
      </div>

      <section className="admin-panel mt-6">
        <h2 className="admin-panel-title">Report types (demo)</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>Publication access by date range, committee, and user role</li>
          <li>Login frequency via session creation (see Dashboard)</li>
          <li>User registration trend (see Dashboard)</li>
          <li>Access report downloads as Excel (.xlsx) with readable column widths</li>
        </ul>
      </section>
    </>
  );
}
