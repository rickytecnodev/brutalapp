import type { PDFDocumentProxy } from 'pdfjs-dist'

type PdfJs = typeof import('pdfjs-dist')

/**
 * PDF.js moderno usa Map.prototype.getOrInsertComputed.
 * Si el navegador no lo trae, el build legacy lo define.
 * Se decide antes de importar, porque el legacy lo instala al cargarse.
 */
const useLegacyPdf =
  typeof (Map.prototype as { getOrInsertComputed?: unknown }).getOrInsertComputed !== 'function'

let pdfJsPromise: Promise<PdfJs> | null = null
let workerReady: Promise<void> | null = null

function loadPdfJs(): Promise<PdfJs> {
  if (!pdfJsPromise) {
    pdfJsPromise = useLegacyPdf
      ? import('pdfjs-dist/legacy/build/pdf.mjs')
      : import('pdfjs-dist')
  }
  return pdfJsPromise
}

export function ensurePdfWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = (async () => {
      const pdfjs = await loadPdfJs()
      const worker = useLegacyPdf
        ? await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
        : await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    })()
  }
  return workerReady
}

export type PdfSource = string | ArrayBuffer | Uint8Array

export async function loadPdfDocument(src: PdfSource): Promise<PDFDocumentProxy> {
  await ensurePdfWorker()
  const { getDocument } = await loadPdfJs()

  const task =
    typeof src === 'string'
      ? getDocument({
          url: src,
          withCredentials: false,
          useSystemFonts: true,
        })
      : getDocument({
          data: src instanceof Uint8Array ? src : new Uint8Array(src),
          withCredentials: false,
          useSystemFonts: true,
        })

  return task.promise
}

export async function releasePdfDocument(doc: PDFDocumentProxy | null): Promise<void> {
  if (!doc) return
  try {
    await doc.cleanup()
  } catch {
    // ignore cleanup errors on tear-down
  }
}

/** DPR alto en móviles hace canvas enormes y lentos. */
export function renderPixelRatio(): number {
  const dpr = window.devicePixelRatio || 1
  return Math.min(2, Math.max(1, dpr))
}
