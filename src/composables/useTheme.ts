import { onMounted, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'brutal-theme'
const theme = ref<ThemeMode>('light')

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', mode)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', mode === 'dark' ? '#0c0a09' : '#9a3412')
  }
}

function readStored(): ThemeMode | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'light' || raw === 'dark' ? raw : null
}

export function useTheme() {
  onMounted(() => {
    theme.value = readStored() ?? (prefersDark() ? 'dark' : 'light')
    applyTheme(theme.value)
  })

  watch(theme, (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)
  })

  function toggleTheme(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(mode: ThemeMode): void {
    theme.value = mode
  }

  return { theme, toggleTheme, setTheme }
}

/** Inicialización temprana (antes del mount) para evitar flash. */
export function initThemeEarly(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const mode: ThemeMode =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    document.documentElement.setAttribute('data-theme', mode)
  } catch {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}
