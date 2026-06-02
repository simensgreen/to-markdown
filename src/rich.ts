import { extname } from 'path';
import { lookup } from 'mime-types';
import { convertToMarkdown } from './convert.js';
import { buildFrontmatter, emitFrontmatter, extractSections } from './utils/metadata.js';
import { chunkMarkdown } from './utils/chunker.js';
import type {
  ConverterInput,
  RichConverterOptions,
  RichDocument,
} from './types/index.js';

/**
 * AI-ready variant of `convertToMarkdown`.
 *
 * Returns a `RichDocument` with the converted markdown plus frontmatter,
 * section tree, and optional RAG-ready chunks — all derived from the same
 * underlying converters. The original `convertToMarkdown` function is
 * unchanged; this is purely additive.
 *
 * @example
 *   const doc = await convertToRichMarkdown('./report.pdf', {
 *     ocr: { enabled: true, pdfMode: 'auto' },
 *     includeChunks: true,
 *     chunkOptions: { maxTokens: 800, overlapTokens: 80 },
 *     emitFrontmatter: true,
 *   });
 *   doc.markdown    // YAML frontmatter + body
 *   doc.frontmatter // structured metadata
 *   doc.sections    // heading-delimited sections
 *   doc.chunks      // RAG chunks with section path
 */
export async function convertToRichMarkdown(
  input: ConverterInput,
  options: RichConverterOptions = {}
): Promise<RichDocument> {
  const {
    includeSections = true,
    includeChunks = false,
    chunkOptions,
    emitFrontmatter: shouldEmit = false,
    tokenizer = 'approx',
    ...converterOpts
  } = options;

  const body = await convertToMarkdown(input, converterOpts);

  const seedFromInput = deriveSeed(input, options);
  const frontmatter = await buildFrontmatter(body, seedFromInput, tokenizer);

  const sections = includeSections ? extractSections(body) : undefined;

  let chunks;
  if (includeChunks) {
    chunks = await chunkMarkdown(body, chunkOptions, {
      chunkIndex: 0,
      totalChunks: 0,
      source: frontmatter.source,
      fileName: frontmatter.fileName,
    });
  }

  const markdown = shouldEmit ? emitFrontmatter(frontmatter, body) : body;

  return { markdown, frontmatter, sections, chunks };
}

function deriveSeed(
  input: ConverterInput,
  options: RichConverterOptions
): Partial<RichDocument['frontmatter']> {
  const seed: Partial<RichDocument['frontmatter']> = {};
  if (options.url) {
    seed.source = options.url;
  }
  if (typeof input === 'string' && !input.startsWith('data:') && !options.url) {
    // Likely a file path; only set source when it looks like one.
    if (/[\\/.]/.test(input) && input.length < 1024) {
      seed.source = input;
    }
  }
  const fileName =
    options.fileName ??
    (typeof input === 'string' && /[\\/]/.test(input) ? input.split(/[\\/]/).pop() : undefined);
  if (fileName) {
    seed.fileName = fileName;
    const ext = extname(fileName).toLowerCase() || options.forceExtension;
    if (ext) {
      seed.extension = ext;
      const mime = lookup(ext);
      if (mime) seed.mimeType = mime;
    }
  } else if (options.forceExtension) {
    seed.extension = options.forceExtension.toLowerCase();
  }
  if (Buffer.isBuffer(input)) {
    seed.sizeBytes = input.byteLength;
  }
  return seed;
}
