import { convertToHtml } from 'mammoth';
import { formatMarkdown } from '../utils/markdown.js';
import { htmlToMarkdown } from './html.js';

/**
 * Converts DOCX buffer to Markdown
 * @param buffer - DOCX file buffer
 * @returns Markdown string
 */
export async function convertDocxToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const result = await convertToHtml({ buffer }, { styleMap: [] });
    const html = result.value || '';

    let markdown = htmlToMarkdown(html);
    markdown = formatMarkdown(markdown);

    return markdown;
  } catch (err: any) {
    throw new Error(`Failed to convert DOCX: ${err.message}`);
  }
}
