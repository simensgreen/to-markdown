import pdf2md from '@opendocsg/pdf2md';
import { ocrImage, resolveOcrOptions } from '../utils/ocr.js';
import { renderPdfPages, pdfRenderAvailable } from '../utils/pdfRender.js';
import type { OCROptions } from '../types/index.js';

/**
 * Converts PDF buffer to Markdown.
 *
 * Backward compatible: when called as `convertPdfToMarkdown(buffer)` the
 * behavior is unchanged — text is extracted via @opendocsg/pdf2md.
 *
 * When `ocr` is provided and enabled, the converter can fall back to OCR
 * for scanned/image-only PDFs (mode 'auto', the default once OCR is on),
 * or always run OCR (mode 'always').
 *
 * Requires optional peer deps `tesseract.js`, `pdfjs-dist`, and a canvas
 * implementation (`@napi-rs/canvas` or `canvas`) for the OCR path.
 *
 * @param buffer - PDF file buffer
 * @param ocr - Optional OCR configuration (opt-in)
 */
export async function convertPdfToMarkdown(
  buffer: Buffer,
  ocr?: boolean | OCROptions
): Promise<string> {
  const ocrOpts = resolveOcrOptions(ocr);
  const mode = ocrOpts?.pdfMode ?? (ocrOpts ? 'auto' : 'never');

  // Always try the fast text path first unless caller explicitly demanded OCR-only.
  let textResult = '';
  if (mode !== 'always') {
    try {
      textResult = (await pdf2md(buffer)) || '';
    } catch (err: any) {
      if (mode === 'never') throw new Error(`Failed to convert PDF: ${err.message}`);
      // else: fall through to OCR
    }
  }

  if (mode === 'never') return textResult;

  const minChars = ocrOpts?.pdfAutoMinChars ?? 100;
  const trimmedLen = textResult.replace(/\s+/g, '').length;
  const needsOcr = mode === 'always' || trimmedLen < minChars;
  if (!needsOcr) return textResult;

  // OCR fallback path
  if (!(await pdfRenderAvailable())) {
    if (textResult) return textResult;
    throw new Error(
      "PDF OCR fallback unavailable: install optional peer dependencies " +
        "`pdfjs-dist` and `@napi-rs/canvas` (or `canvas`), plus `tesseract.js`."
    );
  }

  const pages = await renderPdfPages(buffer, {
    dpi: ocrOpts?.pdfRenderDpi,
    maxPages: ocrOpts?.pdfMaxPages,
  });

  const parts: string[] = [];
  for (const page of pages) {
    try {
      const ocrResult = await ocrImage(page.png, ocrOpts || {});
      const text = (ocrResult.text || '').trim();
      if (text) {
        parts.push(`<!-- page ${page.pageNumber} -->\n\n${text}`);
      }
    } catch (err: any) {
      parts.push(`<!-- page ${page.pageNumber}: OCR failed (${err.message}) -->`);
    }
  }

  const ocrMd = parts.join('\n\n');
  if (mode === 'always') return ocrMd;
  // 'auto': prefer OCR text if the text extraction was sparse but keep anything we did get.
  return ocrMd || textResult;
}
