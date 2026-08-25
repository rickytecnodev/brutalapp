<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'Visor de partitura'"
    >
      <header class="modal__bar">
        <button type="button" class="btn btn-ghost bar-btn" @click="emit('close')">Cerrar</button>
        <div class="modal__title">
          <strong>{{ title }}</strong>
          <span v-if="composer">{{ composer }}</span>
        </div>
        <div class="modal__zoom">
          <button type="button" class="icon-btn" aria-label="Alejar" @click="zoomOut">−</button>
          <span>{{ Math.round(scale * 100) }}%</span>
          <button type="button" class="icon-btn" aria-label="Acercar" @click="zoomIn">+</button>
        </div>
      </header>

      <div ref="scrollerRef" class="modal__body">
        <div v-if="bootError" class="state">
          <p>{{ bootError }}</p>
          <button type="button" class="btn btn-primary" @click="reload">Reintentar</button>
        </div>
        <div v-else-if="booting" class="state">
          <div class="spinner" aria-hidden="true" />
          <p>Preparando partitura…</p>
        </div>
        <div v-else class="pages" :style="{ width: `${pageWidth}px` }">
          <canvas
            v-for="page in pageCount"
            :key="page"
            :ref="(el) => setCanvasRef(page, el)"
            class="page-canvas"
          />
          <p v-if="renderProgress < pageCount" class="progress">
            Renderizando {{ renderProgress }}/{{ pageCount }}
          </p>
        </div>
      </div>

      <footer class="modal__footer">
        <button type="button" class="btn btn-ghost bar-btn" :disabled="currentPage <= 1" @click="goPage(-1)">
          Anterior
        </button>
        <span class="page-label">{{ currentPage }} / {{ pageCount || '—' }}</span>
        <button
          type="button"
          class="btn btn-ghost bar-btn"
          :disabled="currentPage >= pageCount"
          @click="goPage(1)"
        >
          Siguiente
        </button>
      </footer>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type ComponentPublicInstance,
} from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdfDocument, releasePdfDocument } from '@/services/pdfEngine'

const props = defineProps<{
  open: boolean
  src: string | null
  title?: string
  composer?: string
}>()

const emit = defineEmits<{ close: []; retry: [] }>()

/** Solo piso técnico para no romper el canvas; el usuario no ve botones bloqueados. */
const minScale = 0.15
const maxScale = 8
const scaleStep = 0.15

const scrollerRef = ref<HTMLElement | null>(null)
const doc = shallowRef<PDFDocumentProxy | null>(null)
const pageCount = ref(0)
const currentPage = ref(1)
const scale = ref(1)
const pageWidth = ref(0)
const booting = ref(false)
const bootError = ref<string | null>(null)
const renderProgress = ref(0)
const canvasMap = new Map<number, HTMLCanvasElement>()

let renderToken = 0
let scrollLocked = false

function setCanvasRef(page: number, el: Element | ComponentPublicInstance | null): void {
  if (el instanceof HTMLCanvasElement) {
    canvasMap.set(page, el)
  } else {
    canvasMap.delete(page)
  }
}

function fitScale(viewportWidth: number): number {
  const host = scrollerRef.value
  if (!host) return 1
  const available = Math.max(280, host.clientWidth - 24)
  const fitted = available / viewportWidth
  // Ajuste inicial a pantalla, sin empujar al tope de zoom del usuario.
  return Math.min(4, Math.max(0.25, fitted))
}

async function destroyDoc(): Promise<void> {
  renderToken += 1
  canvasMap.clear()
  const current = doc.value
  doc.value = null
  await releasePdfDocument(current)
  pageCount.value = 0
  currentPage.value = 1
  renderProgress.value = 0
}

async function renderAllPages(token: number): Promise<void> {
  const pdf = doc.value
  if (!pdf) return

  await nextTick()
  renderProgress.value = 0

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    if (token !== renderToken) return
    const page = await pdf.getPage(pageNum)
    const base = page.getViewport({ scale: 1 })
    if (pageNum === 1) {
      pageWidth.value = Math.floor(base.width * scale.value)
    }
    const viewport = page.getViewport({ scale: scale.value })
    const canvas = canvasMap.get(pageNum)
    if (!canvas) continue

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) continue

    const outputScale = window.devicePixelRatio || 1
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0)

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise

    renderProgress.value = pageNum
  }
}

async function boot(): Promise<void> {
  if (!props.open || !props.src) return

  booting.value = true
  bootError.value = null
  await destroyDoc()

  try {
    const pdf = await loadPdfDocument(props.src)
    if (!props.open) {
      await releasePdfDocument(pdf)
      return
    }
    doc.value = pdf
    pageCount.value = pdf.numPages

    const first = await pdf.getPage(1)
    const base = first.getViewport({ scale: 1 })
    scale.value = Number(fitScale(base.width).toFixed(2))
    pageWidth.value = Math.floor(base.width * scale.value)

    booting.value = false
    const token = ++renderToken
    await nextTick()
    await renderAllPages(token)
  } catch (err) {
    bootError.value = err instanceof Error ? err.message : 'No se pudo renderizar el PDF.'
    booting.value = false
  }
}

function reload(): void {
  emit('retry')
  void boot()
}

function zoomIn(): void {
  scale.value = Number(Math.min(maxScale, scale.value + scaleStep).toFixed(2))
}

function zoomOut(): void {
  scale.value = Number(Math.max(minScale, scale.value - scaleStep).toFixed(2))
}

function goPage(delta: number): void {
  const next = Math.min(pageCount.value, Math.max(1, currentPage.value + delta))
  currentPage.value = next
  const canvas = canvasMap.get(next)
  if (canvas && scrollerRef.value) {
    scrollLocked = true
    canvas.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      scrollLocked = false
    }, 400)
  }
}

function onScroll(): void {
  if (scrollLocked || !scrollerRef.value || canvasMap.size === 0) return
  const top = scrollerRef.value.scrollTop + 80
  let closest = 1
  let best = Number.POSITIVE_INFINITY
  for (const [page, canvas] of canvasMap) {
    const dist = Math.abs(canvas.offsetTop - top)
    if (dist < best) {
      best = dist
      closest = page
    }
  }
  currentPage.value = closest
}

function onKey(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowRight') goPage(1)
  if (event.key === 'ArrowLeft') goPage(-1)
}

watch(
  () => [props.open, props.src] as const,
  ([open]) => {
    if (open) {
      document.body.style.overflow = 'hidden'
      void boot()
    } else {
      document.body.style.overflow = ''
      void destroyDoc()
    }
  },
)

watch(scale, async () => {
  if (!props.open || !doc.value || booting.value) return
  const token = ++renderToken
  await nextTick()
  await renderAllPages(token)
})

watch(scrollerRef, (el, prev) => {
  prev?.removeEventListener('scroll', onScroll)
  el?.addEventListener('scroll', onScroll, { passive: true })
})

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
  scrollerRef.value?.removeEventListener('scroll', onScroll)
  void destroyDoc()
})
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #0c0a09;
  color: #f5f0e8;
  animation: modal-in 0.22s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal__bar,
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  padding-top: calc(0.65rem + env(safe-area-inset-top, 0px));
  background: rgba(12, 10, 9, 0.94);
  border-bottom: 1px solid #3a342c;
  backdrop-filter: blur(10px);
}

.modal__footer {
  border-bottom: 0;
  border-top: 1px solid #3a342c;
  padding-bottom: calc(0.65rem + env(safe-area-inset-bottom, 0px));
}

.modal__title {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 0.1rem;
  text-align: center;
}

.modal__title strong {
  font-size: 0.92rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal__title span {
  font-size: 0.75rem;
  color: #a89f92;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal__zoom {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  min-width: 6.5rem;
  justify-content: flex-end;
}

.icon-btn,
.bar-btn {
  border-color: #3a342c;
  color: #f5f0e8;
  background: #171412;
  min-width: 2.2rem;
}

.icon-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 1px solid #3a342c;
  font-size: 1.1rem;
  line-height: 1;
}

.icon-btn:disabled,
.bar-btn:disabled {
  opacity: 0.4;
}

.modal__body {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0.75rem 0.6rem 1rem;
}

.pages {
  margin: 0 auto;
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.page-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.state {
  min-height: 50dvh;
  display: grid;
  place-items: center;
  gap: 0.85rem;
  text-align: center;
  color: #f5f0e8;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}

.progress {
  margin: 0;
  color: #a89f92;
  font-size: 0.8rem;
}

.page-label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .modal__title span {
    display: none;
  }

  .bar-btn {
    padding-inline: 0.7rem;
    font-size: 0.82rem;
  }
}
</style>
