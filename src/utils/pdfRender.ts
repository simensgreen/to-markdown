/**
 * Renders a single PDF page to a PNG buffer.
 *
 * Requires optional peer dependencies:
 *   npm install pdfjs-dist
 *   npm install @napi-rs/canvas   (or)   npm install canvas
 */
export async function renderPdfPageToPng(
  buffer: Buffer,
  pageNum: number = 1,
  scale: number = 2.0
): Promise<Buffer> {
  // 1. Load pdfjs-dist
  let pdfjsLib: any;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — optional peer dependency
    pdfjsLib = await import('pdfjs-dist');
  } catch {
    throw new Error(
      'PDF rendering requires pdfjs-dist: npm install pdfjs-dist'
    );
  }

  // 2. Load a canvas implementation (canvas preferred over @napi-rs/canvas for pdfjs compat)
  let createCanvas: (w: number, h: number) => any;
  try {
    // @ts-ignore — optional peer dependency
    const m = await import('canvas');
    createCanvas = m.createCanvas ?? m.default?.createCanvas;
  } catch {
    try {
      // @ts-ignore — optional peer dependency
      const m = await import('@napi-rs/canvas');
      createCanvas = m.createCanvas ?? m.default?.createCanvas;
    } catch {
      throw new Error(
        'PDF rendering requires a canvas library: npm install canvas'
      );
    }
  }

  // 3. Build a CanvasFactory for pdfjs-dist v4+ compatibility
  // pdfjs-dist v4 requires a CanvasFactory when rendering pages with images
  class NodeCanvasFactory {
    create(width: number, height: number) {
      const canvas = createCanvas(width, height);
      const context = canvas.getContext('2d');
      return { canvas, context };
    }
    reset(canvasAndContext: any, width: number, height: number) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: any) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
    }
  }

  const documentParams: any = { data: new Uint8Array(buffer) };
  // pdfjs v4 requires a CanvasFactory instance (lowercase key)
  try {
    documentParams.canvasFactory = new NodeCanvasFactory();
  } catch {
    // ignore — older pdfjs versions don't support this option
  }

  const pdf = await pdfjsLib.getDocument(documentParams).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height)
  );
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toBuffer('image/png');
}
