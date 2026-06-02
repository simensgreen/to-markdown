/**
 * Converter options for converting various file formats to Markdown
 */
export interface ConverterOptions {
  /** Name of the file (helpful for buffer inputs) */
  fileName?: string;
  /** Force a specific file extension for processing */
  forceExtension?: string;
  /** Original URL (used for web content like YouTube or Bing search) */
  url?: string;
  /** Optional OCR configuration. Default: disabled (backward compatible). */
  ocr?: boolean | OCROptions;
}

/**
 * Input type for converter - can be file path, base64 string, or buffer
 */
export type ConverterInput = string | Buffer;

/**
 * Supported file extensions
 */
export enum FileExtension {
  PDF = '.pdf',
  DOCX = '.docx',
  HTML = '.html',
  HTM = '.htm',
  TXT = '.txt',
  IPYNB = '.ipynb',
  XML = '.xml',
  RSS = '.rss',
  ATOM = '.atom',
  XLSX = '.xlsx',
  XLS = '.xls',
  CSV = '.csv',
  MP3 = '.mp3',
  WAV = '.wav',
  PPTX = '.pptx',
  ZIP = '.zip',
  JPG = '.jpg',
  JPEG = '.jpeg',
  PNG = '.png',
  GIF = '.gif',
}

/**
 * Turndown service options for HTML to Markdown conversion
 */
export interface TurndownOptions {
  headingStyle: 'setext' | 'atx';
  hr: string;
  bulletListMarker: string;
  codeBlockStyle: 'indented' | 'fenced';
  emDelimiter: string;
  keepHeaderLevels?: boolean;
}

/**
 * Image metadata interface
 */
export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

/**
 * Audio metadata interface
 */
export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  bitrate?: number;
}

/**
 * Result of file type detection
 */
export interface FileTypeResult {
  ext: string;
  mime: string;
}

/* ============================================================
 * AI-ready additions (v2.1+) — purely additive, opt-in.
 * Existing APIs above are unchanged.
 * ============================================================ */

/**
 * OCR provider identifier. Currently only 'tesseract' (local) is built in.
 * Additional providers (cloud / vision-LLM) can be registered via the OCR
 * provider abstraction in the future.
 */
export type OCRProvider = 'tesseract';

/**
 * How the PDF converter should apply OCR.
 *  - 'never':  no OCR, original behavior (default).
 *  - 'auto':   run OCR only when the text extraction looks empty / too short.
 *  - 'always': render every page and OCR it.
 */
export type PdfOcrMode = 'never' | 'auto' | 'always';

/**
 * Detailed OCR configuration. Passing `ocr: true` is equivalent to
 * `{ enabled: true }` with defaults.
 */
export interface OCROptions {
  /** Enable OCR. Default: false. */
  enabled?: boolean;
  /** Tesseract language codes, e.g. ['eng'], ['eng','tur']. Default: ['eng']. */
  languages?: string[];
  /** Provider to use. Default: 'tesseract'. */
  provider?: OCRProvider;
  /** PDF OCR mode. Default: 'auto' when ocr.enabled, else 'never'. */
  pdfMode?: PdfOcrMode;
  /** Minimum extracted character count under which 'auto' triggers OCR. Default: 100. */
  pdfAutoMinChars?: number;
  /** Render DPI for PDF rasterization (higher = better OCR, slower). Default: 200. */
  pdfRenderDpi?: number;
  /** Maximum number of PDF pages to OCR. Default: unlimited. */
  pdfMaxPages?: number;
}

/**
 * Result of running OCR on a single image / page.
 */
export interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  durationMs?: number;
}

/**
 * Token counting strategies.
 *  - 'approx':    fast heuristic (chars/4), no extra deps.
 *  - 'gpt':       uses gpt-tokenizer (cl100k_base). Loaded dynamically.
 */
export type TokenizerKind = 'approx' | 'gpt';

/**
 * Chunking strategy.
 *  - 'heading':   split on markdown headings, packing children until maxTokens.
 *  - 'paragraph': split on blank lines, packing paragraphs until maxTokens.
 *  - 'fixed':     hard split on token count, ignoring structure.
 */
export type ChunkStrategy = 'heading' | 'paragraph' | 'fixed';

export interface ChunkOptions {
  /** Soft upper bound for tokens per chunk. Default: 1000. */
  maxTokens?: number;
  /** Overlap between consecutive chunks in tokens. Default: 100. */
  overlapTokens?: number;
  /** Splitting strategy. Default: 'heading'. */
  strategy?: ChunkStrategy;
  /** Tokenizer used to count tokens. Default: 'approx'. */
  tokenizer?: TokenizerKind;
  /** Keep fenced code blocks intact even if they exceed maxTokens. Default: true. */
  preserveCodeBlocks?: boolean;
  /** Keep markdown tables intact even if they exceed maxTokens. Default: true. */
  preserveTables?: boolean;
}

/**
 * A single chunk of markdown, suitable for RAG ingestion.
 */
export interface Chunk {
  id: string;
  content: string;
  tokenCount: number;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    /** Heading path leading to this chunk (e.g. ['Intro', 'Goals']). */
    sectionPath?: string[];
    source?: string;
    fileName?: string;
    page?: number;
    [key: string]: any;
  };
}

/**
 * Flat representation of a heading-delimited section in the document.
 */
export interface Section {
  heading: string;
  level: number;
  anchor: string;
  /** Heading path from root to this section, inclusive. */
  path: string[];
  content: string;
  page?: number;
}

/**
 * Frontmatter / document-level metadata accompanying a RichDocument.
 */
export interface DocumentFrontmatter {
  source?: string;
  fileName?: string;
  extension?: string;
  mimeType?: string;
  sizeBytes?: number;
  title?: string;
  language?: string;
  pageCount?: number;
  wordCount?: number;
  charCount?: number;
  tokenCount?: number;
  createdAt?: string;
  /** Free-form passthrough for plugin metadata. */
  [key: string]: any;
}

/**
 * Options for `convertToRichMarkdown`.
 * Extends ConverterOptions plus rich-specific knobs.
 */
export interface RichConverterOptions extends ConverterOptions {
  /** Include `sections` in the result. Default: true. */
  includeSections?: boolean;
  /** Include `chunks` in the result. Default: false. */
  includeChunks?: boolean;
  /** Chunking configuration (only used if includeChunks). */
  chunkOptions?: ChunkOptions;
  /** Include YAML frontmatter at the top of `markdown`. Default: false. */
  emitFrontmatter?: boolean;
  /** Tokenizer used for tokenCount in frontmatter. Default: 'approx'. */
  tokenizer?: TokenizerKind;
}

/**
 * Structured, AI-ready document returned by `convertToRichMarkdown`.
 */
export interface RichDocument {
  /** Final markdown text (possibly prefixed with YAML frontmatter). */
  markdown: string;
  /** Document-level metadata. */
  frontmatter: DocumentFrontmatter;
  /** Heading-delimited sections, in document order. */
  sections?: Section[];
  /** RAG-ready chunks, if requested. */
  chunks?: Chunk[];
  /** Non-fatal issues encountered during conversion. */
  warnings?: string[];
}
