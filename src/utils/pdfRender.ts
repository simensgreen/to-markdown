/**
 * PDF rasterization helper used by the OCR fallback path.
 *
 * Uses `pdfjs-dist` (legacy build) + `@napi-rs/canvas` (or the standard `canvas`
 * package) to render each page to a PNG buffer suitable for Tesseract.
 *
 * Both packages are optional peer dependencies. If neither is installed, the
 * helper returns an empty array and the caller falls back to text-only output.
 */

export interface RenderedPage {
  pageNumber: number;
  png: Buffer;
  width: number;
  height: number;
}

interface PdfjsLike {
  getDocument?: (args: any) => { promise: Promise<any> };
  GlobalWorkerOptions?: { workerSrc?: string };
}

interface CanvasFactoryLike {
  createCanvas: (w: number, h: number) => any;
}

let pdfjsPromise: Promise<PdfjsLike | null> | null = null;
let canvasPromise: Promise<CanvasFactoryLike | null> | null = null;

async function loadPdfjs(): Promise<PdfjsLike | null> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = (async () => {
    // Try the legacy build first (works in plain Node without DOM polyfills).
    const candidates = [
      'pdfjs-dist/legacy/build/pdf.mjs',
      'pdfjs-dist/legacy/build/pdf.js',
      'pdfjs-dist',
    ];
    for (const id of candidates) {
      try {
        // @ts-ignore: optional peer dep, may not be installed
        const mod: any = await import(id);
        const pdfjs = (mod.default || mod) as PdfjsLike;
        if (pdfjs?.getDocument) return pdfjs;
      } catch {
        /* try next */
      }
    }
    return null;
  })();
  return pdfjsPromise;
}

async function loadCanvas(): Promise<CanvasFactoryLike | null> {
  if (canvasPromise) return canvasPromise;
  canvasPromise = (async () => {
    const candidates = ['@napi-rs/canvas', 'canvas'];
    for (const id of candidates) {
      try {
        // @ts-ignore: optional peer dep, may not be installed
        const mod: any = await import(id);
        const createCanvas = mod.createCanvas || mod.default?.createCanvas;
        if (typeof createCanvas === 'function') return { createCanvas };
      } catch {
        /* try next */
      }
    }
    return null;
  })();
  return canvasPromise;
}

/**
 * Lightweight check: are the optional packages needed for PDF→image available?
 */
export async function pdfRenderAvailable(): Promise<boolean> {
  const [pdfjs, canvas] = await Promise.all([loadPdfjs(), loadCanvas()]);
  return !!(pdfjs && canvas);
}

/**
 * Render PDF pages as PNG buffers.
 *
 * @param buffer PDF binary
 * @param opts   dpi: render density (default 200); maxPages: hard cap
 * @returns rendered pages, or `[]` if the renderer deps are missing
 */
export async function renderPdfPages(
  buffer: Buffer,
  opts: { dpi?: number; maxPages?: number } = {}
): Promise<RenderedPage[]> {
  const pdfjs = await loadPdfjs();
  const canvasFactory = await loadCanvas();
  if (!pdfjs || !canvasFactory) return [];

  const dpi = opts.dpi ?? 200;
  const scale = dpi / 72;

  const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const loadingTask = pdfjs.getDocument!({ data: uint8, disableWorker: true, isEvalSupported: false });
  const doc: any = await loadingTask.promise;

  const totalPages: number = doc.numPages;
  const limit = Math.min(totalPages, opts.maxPages ?? totalPages);
  const out: RenderedPage[] = [];

  for (let p = 1; p <= limit; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale });
    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);
    const canvas = canvasFactory.createCanvas(width, height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport,
      // pdfjs accepts a canvasFactory but defaults work for both backends.
    }).promise;

    const png: Buffer = typeof canvas.toBuffer === 'function'
      ? canvas.toBuffer('image/png')
      : Buffer.from(canvas.toDataURL('image/png').split(',')[1], 'base64');

    out.push({ pageNumber: p, png, width, height });

    if (typeof page.cleanup === 'function') page.cleanup();
  }

  if (typeof doc.cleanup === 'function') doc.cleanup();
  return out;
}
