import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let workerReady = false

export function ensurePdfWorker(): void {
  if (workerReady) return
  GlobalWorkerOptions.workerSrc = pdfWorker
  workerReady = true
}

export async function loadPdfDocument(src: string): Promise<PDFDocumentProxy> {
  ensurePdfWorker()
  const task = getDocument({
    url: src,
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
