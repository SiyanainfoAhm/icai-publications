import ExcelJS from "exceljs";

export interface ExcelColumn {
  key: string;
  header: string;
  /** Minimum width in Excel character units */
  minWidth?: number;
  /** Maximum width cap */
  maxWidth?: number;
}

function widthForColumn(
  sheet: ExcelJS.Worksheet,
  colIndex: number,
  header: string,
  minWidth: number,
  maxWidth: number,
): number {
  let max = header.length;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const value = row.getCell(colIndex).value;
    const text =
      value == null
        ? ""
        : typeof value === "object" && "text" in value
          ? String((value as { text?: string }).text ?? "")
          : String(value);
    max = Math.max(max, text.length);
  });
  return Math.min(Math.max(max + 2, minWidth), maxWidth);
}

export async function buildExcelBuffer(
  sheetName: string,
  rows: Record<string, string>[],
  columns: ExcelColumn[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ICAI Publications Portal";
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.minWidth ?? 12,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  for (const row of rows) {
    sheet.addRow(columns.map((c) => row[c.key] ?? ""));
  }

  columns.forEach((col, i) => {
    const excelCol = sheet.getColumn(i + 1);
    excelCol.width = widthForColumn(
      sheet,
      i + 1,
      col.header,
      col.minWidth ?? 12,
      col.maxWidth ?? 48,
    );
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export function excelResponse(filename: string, buffer: Buffer): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
