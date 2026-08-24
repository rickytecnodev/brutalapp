/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'pdfjs-dist/build/pdf.worker.min.mjs?url' {
  const workerSrc: string
  export default workerSrc
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@/data/repertoire.json' {
  import type { Score } from '@/types/score'
  const data: Score[]
  export default data
}

declare module '@/data/catalogSets.json' {
  import type { CatalogSetEntry, CatalogSetOption } from '@/types/score'
  const data: {
    defaultSetId: string
    sets: CatalogSetOption[]
    entries: Record<string, CatalogSetEntry[]>
  }
  export default data
}
