import type { DocumentFrontmatter, Section, TokenizerKind } from '../types/index.js';
import { countTokens } from './tokenizer.js';

const ANCHOR_BAD = /[^a-z0-9À-ɏ一-鿿\- ]+/gi;

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(ANCHOR_BAD, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  used.add(slug);
  return slug;
}

/**
 * Walk a markdown document and extract heading-delimited sections, skipping
 * content inside fenced code blocks (so a `# foo` inside a code sample is not
 * mistaken for a heading).
 */
export function extractSections(markdown: string): Section[] {
  const lines = markdown.split(/\r?\n/);
  const sections: Section[] = [];
  const used = new Set<string>();
  const headingStack: string[] = [];

  let current: Section | null = null;
  let inFence = false;
  let buf: string[] = [];

  const flush = () => {
    if (current) {
      current.content = buf.join('\n').trim();
      sections.push(current);
    }
    buf = [];
  };

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (inFence) {
      if (current) buf.push(line);
      continue;
    }
    const m = /^(#{1,6})\s+(.*\S)\s*$/.exec(line);
    if (m) {
      flush();
      const level = m[1].length;
      const heading = m[2];
      headingStack.length = level - 1;
      headingStack[level - 1] = heading;
      current = {
        heading,
        level,
        anchor: slugify(heading, used),
        path: headingStack.slice(0, level),
        content: '',
      };
      continue;
    }
    if (current) buf.push(line);
    else buf.push(line);
  }

  if (current) {
    flush();
  } else if (buf.length) {
    // No headings at all — emit a single synthetic section so consumers always
    // get at least one structural entry to attach metadata to.
    sections.push({
      heading: '',
      level: 0,
      anchor: 'document',
      path: [],
      content: buf.join('\n').trim(),
    });
  }
  return sections;
}

/**
 * Best-effort title extraction: first H1, then first non-empty line.
 */
export function extractTitle(markdown: string): string | undefined {
  const h1 = /^#\s+(.*\S)\s*$/m.exec(markdown);
  if (h1) return h1[1];
  const firstLine = markdown.split(/\r?\n/).find((l) => l.trim());
  return firstLine?.trim().slice(0, 200) || undefined;
}

/**
 * Build a frontmatter object from a markdown document. Optional fields can be
 * preseeded by the caller (e.g. source, fileName) — fields supplied in
 * `seed` always win.
 */
export async function buildFrontmatter(
  markdown: string,
  seed: Partial<DocumentFrontmatter> = {},
  tokenizer: TokenizerKind = 'approx'
): Promise<DocumentFrontmatter> {
  const charCount = markdown.length;
  const wordCount = (markdown.match(/\S+/g) || []).length;
  const tokenCount = await countTokens(markdown, tokenizer);
  const title = seed.title ?? extractTitle(markdown);

  return {
    title,
    charCount,
    wordCount,
    tokenCount,
    ...seed,
  };
}

/**
 * Serialize frontmatter as YAML at the top of a markdown document.
 * Skips null/undefined values and arrays/objects (kept simple by design).
 */
export function emitFrontmatter(fm: DocumentFrontmatter, markdown: string): string {
  const lines: string[] = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v == null) continue;
    if (typeof v === 'object') continue; // keep YAML one-level for now
    const str = typeof v === 'string' ? quoteIfNeeded(v) : String(v);
    lines.push(`${k}: ${str}`);
  }
  lines.push('---', '');
  return lines.join('\n') + markdown;
}

function quoteIfNeeded(s: string): string {
  if (/^[\w\-./@:+ ]+$/.test(s) && !/^[-?:,&*!|>'"%@`]/.test(s)) return s;
  return JSON.stringify(s);
}
