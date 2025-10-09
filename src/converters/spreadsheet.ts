import { read, utils } from 'xlsx';
import { parse } from 'papaparse';
import { formatMarkdown, arrayToMarkdownTable } from '../utils/markdown.js';

/**
 * Converts Excel buffer to Markdown
 * @param buffer - Excel file buffer
 * @returns Markdown string
 */
export async function convertExcelToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const wb = read(buffer, { type: 'buffer' });

    let md = '';

    wb.SheetNames.forEach((sheetName) => {
      md += `## ${sheetName}\n\n`;

      const ws = wb.Sheets[sheetName];
      const json = utils.sheet_to_json(ws, { header: 1 });

      md += arrayToMarkdownTable(json as any[][]) + '\n\n';
    });

    return formatMarkdown(md);
  } catch (err: any) {
    throw new Error(`Failed to convert Excel: ${err.message}`);
  }
}

/**
 * Converts CSV buffer to Markdown
 * @param buffer - CSV file buffer
 * @returns Markdown string
 */
export function convertCsvToMarkdown(buffer: Buffer): string {
  try {
    const text = buffer.toString('utf-8');
    const result = parse(text, { delimiter: ',', skipEmptyLines: true });
    const data = result.data as any[][];

    return formatMarkdown(arrayToMarkdownTable(data));
  } catch (err: any) {
    throw new Error(`Failed to convert CSV: ${err.message}`);
  }
}
