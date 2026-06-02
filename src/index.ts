import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { convertToMarkdown } from './convert.js';

/**
 * Main function to convert various file formats to Markdown.
 *
 * Re-exported from `./convert.js` for backward-compatible imports
 * (`import { convertToMarkdown } from '@cognipeer/to-markdown'`).
 *
 * @example
 * ```typescript
 * // Convert from file path
 * const result = await convertToMarkdown('/path/to/document.docx');
 *
 * // Convert from buffer
 * const buffer = fs.readFileSync('document.pdf');
 * const result = await convertToMarkdown(buffer, { fileName: 'document.pdf' });
 *
 * // Convert from base64
 * const base64 = 'data:application/pdf;base64,JVBERi0xLjUNCiW...';
 * const result = await convertToMarkdown(base64);
 *
 * // (Opt-in) OCR for image-only PDFs and image files
 * const result = await convertToMarkdown('./scanned.pdf', {
 *   ocr: { enabled: true, languages: ['eng', 'tur'], pdfMode: 'auto' }
 * });
 * ```
 */
export { convertToMarkdown };

/**
 * Saves markdown content to a file
 *
 * @param content - The markdown content to save
 * @param fileName - Name for the output file (without extension)
 * @param outputDir - Directory to save the file (defaults to "output")
 * @returns Promise<string> - Path to the saved file
 */
export async function saveToMarkdownFile(
  content: string,
  fileName: string,
  outputDir: string = 'output'
): Promise<string> {
  try {
    const outputPath = isAbsolute(outputDir)
      ? outputDir
      : join(process.cwd(), outputDir);

    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
    }

    const mdFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    const filePath = join(outputPath, mdFileName);

    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  } catch (err: any) {
    throw new Error(`Failed to save markdown file: ${err.message}`);
  }
}

// Export all types
export * from './types/index.js';

// AI-ready additions (v2.1+) — purely additive, opt-in.
export { convertToRichMarkdown } from './rich.js';
export { chunkMarkdown } from './utils/chunker.js';
export { countTokens } from './utils/tokenizer.js';
export { extractSections, buildFrontmatter, emitFrontmatter, extractTitle } from './utils/metadata.js';
export { ocrImage } from './utils/ocr.js';

// Default export for backward compatibility
export default {
  convertToMarkdown,
  saveToMarkdownFile,
};
