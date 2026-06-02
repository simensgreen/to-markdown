import type { Chunk, ChunkOptions, TokenizerKind } from '../types/index.js';
import { countTokens, countTokensSync } from './tokenizer.js';

const DEFAULTS: Required<Omit<ChunkOptions, 'tokenizer'>> & { tokenizer: TokenizerKind } = {
  maxTokens: 1000,
  overlapTokens: 100,
  strategy: 'heading',
  tokenizer: 'approx',
  preserveCodeBlocks: true,
  preserveTables: true,
};

interface Block {
  text: string;
  kind: 'heading' | 'code' | 'table' | 'paragraph' | 'list' | 'blank';
  headingLevel?: number;
  headingText?: string;
  tokens: number;
}

/**
 * Split markdown into atomic blocks. Code fences and tables are kept intact.
 */
function parseBlocks(md: string, opts: { preserveCodeBlocks: boolean; preserveTables: boolean }): Block[] {
  const blocks: Block[] = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  let buf: string[] = [];
  let bufKind: Block['kind'] = 'paragraph';

  const flush = () => {
    if (!buf.length) return;
    const text = buf.join('\n');
    if (text.trim()) {
      blocks.push({ text, kind: bufKind, tokens: countTokensSync(text) });
    }
    buf = [];
    bufKind = 'paragraph';
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (opts.preserveCodeBlocks && /^```/.test(line)) {
      flush();
      const fenceStart = i;
      const fence: string[] = [line];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        fence.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        fence.push(lines[i]); // closing fence
        i++;
      }
      const text = fence.join('\n');
      blocks.push({ text, kind: 'code', tokens: countTokensSync(text) });
      continue;
    }

    // Markdown table (header line + separator + rows)
    if (opts.preserveTables && /^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*[:\-]+/.test(lines[i + 1])) {
      flush();
      const tbl: string[] = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        tbl.push(lines[i]);
        i++;
      }
      const text = tbl.join('\n');
      blocks.push({ text, kind: 'table', tokens: countTokensSync(text) });
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.*\S)\s*$/.exec(line);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      blocks.push({
        text: line,
        kind: 'heading',
        headingLevel: level,
        headingText,
        tokens: countTokensSync(line),
      });
      i++;
      continue;
    }

    // Blank line separator
    if (line.trim() === '') {
      flush();
      i++;
      continue;
    }

    // List item — treat each contiguous list block as one paragraph-like unit
    if (/^\s*([*+\-]|\d+\.)\s+/.test(line)) {
      if (bufKind !== 'list') flush();
      bufKind = 'list';
      buf.push(line);
      i++;
      continue;
    }

    // Default: paragraph
    if (bufKind !== 'paragraph') flush();
    bufKind = 'paragraph';
    buf.push(line);
    i++;
  }
  flush();
  return blocks;
}

/**
 * Track the current heading path as we walk blocks in document order.
 */
function updateHeadingPath(path: string[], block: Block): string[] {
  if (block.kind !== 'heading' || !block.headingLevel || !block.headingText) return path;
  const next = path.slice(0, block.headingLevel - 1);
  next[block.headingLevel - 1] = block.headingText;
  return next;
}

function lastNTokens(text: string, n: number): string {
  if (n <= 0 || !text) return '';
  const approxChars = n * 4;
  if (text.length <= approxChars) return text;
  // Try to cut on a paragraph boundary first
  const slice = text.slice(text.length - approxChars);
  const nl = slice.indexOf('\n\n');
  return nl > -1 ? slice.slice(nl + 2) : slice;
}

function packBlocks(
  blocks: Block[],
  opts: Required<Omit<ChunkOptions, 'tokenizer'>> & { tokenizer: TokenizerKind },
  baseMeta: Chunk['metadata'] | undefined
): Chunk[] {
  const chunks: Chunk[] = [];
  let current: { text: string; tokens: number; path: string[] } = { text: '', tokens: 0, path: [] };
  let headingPath: string[] = [];

  const pushChunk = () => {
    if (!current.text.trim()) return;
    chunks.push({
      id: `chunk-${chunks.length}`,
      content: current.text.trim(),
      tokenCount: current.tokens,
      metadata: {
        ...(baseMeta || {}),
        chunkIndex: chunks.length,
        totalChunks: 0, // patched below
        sectionPath: current.path.length ? [...current.path] : undefined,
      },
    });
  };

  for (const block of blocks) {
    headingPath = updateHeadingPath(headingPath, block);

    // Strategy-specific behavior
    if (opts.strategy === 'heading' && block.kind === 'heading' && block.headingLevel && block.headingLevel <= 2) {
      // Start a new chunk at top-level headings
      if (current.text.trim() && current.tokens > opts.maxTokens / 3) {
        pushChunk();
        const carry = opts.overlapTokens > 0 ? lastNTokens(current.text, opts.overlapTokens) : '';
        current = { text: carry, tokens: countTokensSync(carry), path: [...headingPath] };
      } else {
        current.path = [...headingPath];
      }
    }

    // Would adding this block exceed the budget?
    const projected = current.tokens + block.tokens + 1;
    const tooBig = projected > opts.maxTokens;

    if (tooBig && current.text.trim()) {
      pushChunk();
      const carry = opts.overlapTokens > 0 ? lastNTokens(current.text, opts.overlapTokens) : '';
      current = { text: carry, tokens: countTokensSync(carry), path: [...headingPath] };
    }

    // Hard-split oversized atomic blocks only in 'fixed' or when preservation is off
    if (block.tokens > opts.maxTokens && opts.strategy === 'fixed') {
      const chars = opts.maxTokens * 4;
      for (let off = 0; off < block.text.length; off += chars) {
        const piece = block.text.slice(off, off + chars);
        chunks.push({
          id: `chunk-${chunks.length}`,
          content: piece,
          tokenCount: countTokensSync(piece),
          metadata: {
            ...(baseMeta || {}),
            chunkIndex: chunks.length,
            totalChunks: 0,
            sectionPath: headingPath.length ? [...headingPath] : undefined,
          },
        });
      }
      continue;
    }

    current.text += (current.text ? '\n\n' : '') + block.text;
    current.tokens += block.tokens + 1;
    if (!current.path.length) current.path = [...headingPath];
  }

  pushChunk();

  const total = chunks.length;
  for (const c of chunks) c.metadata.totalChunks = total;
  return chunks;
}

/**
 * Split a markdown document into RAG-ready chunks.
 * Heading-aware by default; preserves fenced code blocks and tables.
 *
 * @example
 *   const chunks = await chunkMarkdown(md, { maxTokens: 800, overlapTokens: 80 });
 */
export async function chunkMarkdown(
  markdown: string,
  options: ChunkOptions = {},
  baseMeta?: Chunk['metadata']
): Promise<Chunk[]> {
  const opts = { ...DEFAULTS, ...options };
  const blocks = parseBlocks(markdown, {
    preserveCodeBlocks: opts.preserveCodeBlocks,
    preserveTables: opts.preserveTables,
  });

  const chunks = packBlocks(blocks, opts, baseMeta);

  // Recompute tokenCount with the requested tokenizer (more accurate than sync approx).
  if (opts.tokenizer && opts.tokenizer !== 'approx') {
    for (const c of chunks) {
      c.tokenCount = await countTokens(c.content, opts.tokenizer);
    }
  }
  return chunks;
}
