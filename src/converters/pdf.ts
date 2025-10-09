import pdf2md from '@opendocsg/pdf2md';

/**
 * Converts PDF buffer to Markdown
 * @param buffer - PDF file buffer
 * @returns Markdown string
 */
export async function convertPdfToMarkdown(buffer: Buffer): Promise<string> {
  const result = await pdf2md(buffer);
  return result;
}
