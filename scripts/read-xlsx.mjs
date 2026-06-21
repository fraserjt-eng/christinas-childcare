// Inspect an .xlsx: sheet names, headers, row count, a couple of sample rows.
// Usage: node scripts/read-xlsx.mjs <file.xlsx>
import ExcelJS from 'exceljs';

const path = process.argv[2];
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(path);

wb.eachSheet((ws) => {
  console.log(`\n=== SHEET "${ws.name}"  rows=${ws.actualRowCount}  cols=${ws.actualColumnCount} ===`);
  const headerRow = ws.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => { headers[col] = cell.text; });
  console.log('HEADERS:', headers.filter((h) => h != null).map((h, i) => `${i + 1}:${h}`).join(' | '));
  const sample = Math.min(3, ws.actualRowCount);
  for (let r = 2; r <= sample; r++) {
    const vals = [];
    ws.getRow(r).eachCell({ includeEmpty: true }, (cell, col) => { vals[col] = cell.text; });
    console.log(`ROW ${r}:`, JSON.stringify(vals.filter((v) => v != null)));
  }
});
