import sharp from 'sharp';
import { parseBuffer } from 'music-metadata';
import { formatMarkdown } from '../utils/markdown.js';
import type { ImageMetadata, AudioMetadata } from '../types/index.js';

/**
 * Converts image buffer to Markdown with metadata
 * @param buffer - Image file buffer
 * @param ext - File extension
 * @returns Markdown string with image metadata
 */
export async function convertImageToMarkdown(
  buffer: Buffer,
  ext: string
): Promise<string> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let md = '';

    if (metadata.width && metadata.height) {
      md += `ImageSize: ${metadata.width}x${metadata.height}\n`;
    }

    if (metadata.format) {
      md += `Format: ${metadata.format}\n`;
    }

    // TODO: Add OCR for image text extraction

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
