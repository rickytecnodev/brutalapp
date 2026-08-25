import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let workerReady = false

export function ensurePdfWorker(): void {
  if (workerReady) return
  GlobalWorkerOptions.workerSrc = pdfWorker
  workerReady = true
}

export type PdfSource = string | ArrayBuffer | Uint8Array

export async function loadPdfDocument(src: PdfSource): Promise<PDFDocumentProxy> {
  ensurePdfWorker()

  const task = getDocument({
    ...(typeof src === 'string' ? { url: src } : { data: src }),
    withCredentials: false,
    useSystemFonts: true,
    // Streaming / rangos: empieza a parsear sin esperar el archivo completo
    disableStream: false,
    disableAutoFetch: false,
    // Menos trabajo en el hilo principal al inicio
    isEvalSupported: false,
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
