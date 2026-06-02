import type { OCROptions, OCRResult } from '../types/index.js';

/**
 * Normalize a user-supplied `ocr` option (boolean or full object) into a full OCROptions.
 * Returns `null` when OCR is not enabled.
 */
export function resolveOcrOptions(input: boolean | OCROptions | undefined): OCROptions | null {
  if (!input) return null;
  if (input === true) return { enabled: true };
  if (!input.enabled) return null;
  return input;
}

interface TesseractWorkerLike {
  recognize(buffer: Buffer | Uint8Array): Promise<{ data: { text: string; confidence?: number } }>;
  terminate(): Promise<void>;
}

interface TesseractModuleLike {
  createWorker(langs: string | string[]): Promise<TesseractWorkerLike>;
}

let tesseractModulePromise: Promise<TesseractModuleLike | null> | null = null;

async function loadTesseract(): Promise<TesseractModuleLike | null> {
  if (tesseractModulePromise) return tesseractModulePromise;
  tesseractModulePromise = (async () => {
    try {
      // @ts-ignore: optional peer dep, may not be installed
      const mod: any = await import('tesseract.js');
      return (mod.default || mod) as TesseractModuleLike;
    } catch {
      return null;
    }
  })();
  return tesseractModulePromise;
}

/**
 * Run OCR on a raw image buffer (PNG, JPEG, ...). Returns extracted text plus
 * a confidence score where available.
 *
 * Lazily imports `tesseract.js`; throws a helpful error if not installed.
 */
export async function ocrImage(buffer: Buffer, options: OCROptions = {}): Promise<OCRResult> {
  const langs = options.languages && options.languages.length ? options.languages : ['eng'];
  const provider = options.provider || 'tesseract';

  if (provider !== 'tesseract') {
    throw new Error(`OCR provider '${provider}' is not built in. Pass a custom provider via plugin API (coming soon).`);
  }

  const tess = await loadTesseract();
  if (!tess) {
    throw new Error(
      "OCR requested but 'tesseract.js' is not installed. " +
        "Install it as a peer dependency: `npm install tesseract.js`."
    );
  }

  const t0 = Date.now();
  const worker = await tess.createWorker(langs);
  try {
    const result = await worker.recognize(buffer);
    return {
      text: result?.data?.text || '',
      confidence: result?.data?.confidence,
      language: langs.join('+'),
      durationMs: Date.now() - t0,
    };
  } finally {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
  }
}
