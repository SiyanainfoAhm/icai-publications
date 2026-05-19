/** Parse a simple CSV (quoted fields supported) into rows of cell values. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  return rows;
}

export function toCsv(rows: Record<string, string>[], columns: string[]): string {
  const escape = (v: string) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((c) => escape(row[c] ?? "")).join(","));
  return [header, ...lines].join("\r\n");
}

export function csvResponse(filename: string, csv: string): Response {
  const body = csv.startsWith("\uFEFF") ? csv : `\uFEFF${csv}`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

const IMPORT_TEMPLATE_HEADERS = [
  "publication_type",
  "title",
  "slug",
  "committee",
  "topic",
  "keywords",
  "release_date",
  "status",
  "synopsis",
] as const;

export function publicationImportTemplateCsv(): string {
  const sample = [
    "pdf_publication",
    "Sample handbook",
    "sample-handbook-2026",
    "Board of Studies",
    "Audit & Assurance",
    "audit, handbook",
    "2026-05-01",
    "draft",
    "Optional synopsis text",
  ];
  return toCsv([Object.fromEntries(IMPORT_TEMPLATE_HEADERS.map((h, i) => [h, sample[i] ?? ""]))], [
    ...IMPORT_TEMPLATE_HEADERS,
  ]);
}
