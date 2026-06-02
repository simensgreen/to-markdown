import type { TokenizerKind } from '../types/index.js';

/**
 * Approximate token count using the classic chars/4 heuristic.
 * Reasonable for English-leaning text; pessimistic for code, optimistic for CJK.
 */
function approxCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

let gptEncoder: ((text: string) => number[]) | null = null;
let gptEncoderLoadAttempted = false;

async function loadGptEncoder(): Promise<((text: string) => number[]) | null> {
  if (gptEncoder || gptEncoderLoadAttempted) return gptEncoder;
  gptEncoderLoadAttempted = true;
  try {
    // Dynamic import — gpt-tokenizer is an optional peer dependency.
    // @ts-ignore: optional peer dep, may not be installed
    const mod: any = await import('gpt-tokenizer');
    const enc = mod.encode || mod.default?.encode;
    if (typeof enc === 'function') {
      gptEncoder = enc;
    }
  } catch {
    gptEncoder = null;
  }
  return gptEncoder;
}

/**
 * Count tokens in `text` using the requested tokenizer.
 * Falls back to the approximate counter if the gpt tokenizer is not available.
 */
export async function countTokens(
  text: string,
  kind: TokenizerKind = 'approx'
): Promise<number> {
  if (!text) return 0;
  if (kind === 'gpt') {
    const enc = await loadGptEncoder();
    if (enc) {
      try {
        return enc(text).length;
      } catch {
        // fall through to approx
      }
    }
  }
  return approxCount(text);
}

/**
 * Synchronous approximate counter — useful inside tight loops where the
 * caller can't await.
 */
export function countTokensSync(text: string): number {
  return approxCount(text);
}
