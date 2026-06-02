import sizeOf from 'image-size';
import { parseBuffer } from 'music-metadata';
import { formatMarkdown } from '../utils/markdown.js';
import { ocrImage, resolveOcrOptions } from '../utils/ocr.js';
import type { OCROptions } from '../types/index.js';

/**
 * Converts image buffer to Markdown with metadata.
 *
 * Backward compatible: when called as `convertImageToMarkdown(buffer, ext)`
 * the output is unchanged (size + format metadata only).
 *
 * When `ocr` is provided and enabled, OCR text is appended below the metadata.
 *
 * @param buffer - Image file buffer
 * @param ext - File extension
 * @param ocr - Optional OCR configuration (opt-in)
 */
export async function convertImageToMarkdown(
  buffer: Buffer,
  ext: string,
  ocr?: boolean | OCROptions
): Promise<string> {
  try {
    const dimensions = sizeOf(buffer);

    let md = '';

    if (dimensions.width && dimensions.height) {
      md += `ImageSize: ${dimensions.width}x${dimensions.height}\n`;
    }

    if (dimensions.type) {
      md += `Format: ${dimensions.type}\n`;
    }

    const ocrOpts = resolveOcrOptions(ocr);
    if (ocrOpts) {
      try {
        const result = await ocrImage(buffer, ocrOpts);
        const text = (result.text || '').trim();
        if (text) {
          md += `\n## Extracted Text (OCR)\n\n${text}\n`;
        }
      } catch (err: any) {
        md += `\n<!-- OCR failed: ${err.message} -->\n`;
      }
    }

    return formatMarkdown(md);
  } catch (err: any) {
    throw new Error(`Failed to convert image: ${err.message}`);
  }
}

/**
 * Converts audio buffer to Markdown with metadata
 * @param buffer - Audio file buffer
 * @param ext - File extension
 * @returns Markdown string with audio metadata
 */
export async function convertAudioToMarkdown(
  buffer: Buffer,
  ext: string
): Promise<string> {
  try {
    const metadata = await parseBuffer(buffer);
    let md = '';

    if (metadata.common.title) md += `Title: ${metadata.common.title}\n`;
    if (metadata.common.artist) md += `Artist: ${metadata.common.artist}\n`;
    if (metadata.common.album) md += `Album: ${metadata.common.album}\n`;
    if (metadata.format.duration)
      md += `Duration: ${metadata.format.duration} sec\n`;
    if (metadata.format.bitrate)
      md += `Bitrate: ${metadata.format.bitrate} kbps\n`;

    // TODO: Add speech-to-text transcription

    return formatMarkdown(md);
  } catch (err: any) {
    throw new Error(`Failed to convert audio: ${err.message}`);
  }
}
