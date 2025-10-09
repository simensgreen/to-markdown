import AdmZip from 'adm-zip';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { parseStringPromise } from 'xml2js';
import { formatMarkdown } from '../utils/markdown.js';
import type { ConverterOptions } from '../types/index.js';

/**
 * Converts PowerPoint buffer to Markdown
 * @param buffer - PPTX file buffer
 * @returns Markdown string
 */
export async function convertPptxToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const tempPath = join(process.cwd(), 'temp_pptx_' + Date.now() + '.zip');
    writeFileSync(tempPath, buffer);

    const zip = new AdmZip(tempPath);
    const entries = zip.getEntries();

    let md = '';

    for (const entry of entries) {
      if (entry.entryName.startsWith('ppt/slides/slide')) {
        const slideXml = entry.getData().toString('utf-8');
        const slideMd = await extractTextFromSlideXml(slideXml);

        md += `\n\n<!-- ${entry.entryName} -->\n` + slideMd + '\n';
      }
    }

    unlinkSync(tempPath);

    return formatMarkdown(md);
  } catch (err: any) {
    throw new Error(`Failed to convert PPTX: ${err.message}`);
  }
}

/**
 * Extracts text from PowerPoint slide XML
 * @param xml - Slide XML content
 * @returns Extracted text
 */
async function extractTextFromSlideXml(xml: string): Promise<string> {
  const result = await parseStringPromise(xml);
  const texts: string[] = [];

  function traverse(obj: any): void {
    if (!obj) return;
    if (obj['a:t']) {
      texts.push(obj['a:t'].join(' '));
    }
    for (const k in obj) {
      if (typeof obj[k] === 'object') {
        traverse(obj[k]);
      }
    }
  }

  traverse(result);

  return texts.join(' ');
}

/**
 * Converts ZIP archive buffer to Markdown
 * @param buffer - ZIP file buffer
 * @param options - Converter options
 * @returns Markdown string
 */
export async function convertZipToMarkdown(
  buffer: Buffer,
  options: ConverterOptions
): Promise<string> {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    let md = `Content from the zip file:\n\n`;

    // Note: This would create circular dependency if we import convertToMarkdown
    // In the main index.ts, we'll handle this differently
    for (const entry of entries) {
      if (!entry.isDirectory) {
        const fileName = entry.entryName;
        md += `## File: ${fileName}\n\n`;
        md += `(Binary content - ${entry.getData().length} bytes)\n\n`;
      }
    }

    return formatMarkdown(md);
  } catch (err: any) {
    throw new Error(`Failed to convert ZIP: ${err.message}`);
  }
}
