import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'pdf')
const destDir = path.join(root, 'public', 'scores')
const outJson = path.join(root, 'src', 'data', 'repertoire.json')

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .replace(/~/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseTitleComposer(base) {
  const cleaned = base.replace(/\s*-\s*Partes$/i, '').replace(/\s*-\s*Instrumental$/i, '').trim()
  const dash = cleaned.split(/\s+-\s+/)
  if (dash.length >= 2) {
    return { title: dash[0].trim(), composer: dash.slice(1).join(' - ').trim() }
  }
  const paren = cleaned.match(/^(.+?)\s*\((.+)\)\s*$/)
  if (paren) {
    return { title: paren[1].trim(), composer: paren[2].trim() }
  }
  return { title: cleaned.trim(), composer: 'Desconocido' }
}

if (!fs.existsSync(srcDir)) {
  console.error('No existe la carpeta pdf/ en la raíz del proyecto.')
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })
for (const entry of fs.readdirSync(destDir)) {
  if (entry.toLowerCase().endsWith('.pdf')) {
    fs.unlinkSync(path.join(destDir, entry))
  }
}

const files = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
const used = new Set()
const repertoire = []

for (const file of files) {
  const base = file.replace(/\.pdf$/i, '')
  const { title, composer } = parseTitleComposer(base)
  let id = slugify(base) || 'pieza'
  let unique = id
  let n = 2
  while (used.has(unique)) {
    unique = `${id}-${n}`
    n += 1
  }
  used.add(unique)
  const destName = `${unique}.pdf`
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, destName))
  repertoire.push({
    id: unique,
    title,
    composer,
    pdf: `/scores/${destName}`,
    sourceFile: file,
  })
}

repertoire.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }))
fs.writeFileSync(outJson, `${JSON.stringify(repertoire, null, 2)}\n`, 'utf8')
console.log(`Sincronizadas ${repertoire.length} partituras → public/scores + src/data/repertoire.json`)
