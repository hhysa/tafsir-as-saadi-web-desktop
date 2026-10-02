import { documentNodes } from './documentLists.js'

function plainParagraphs(nodes) {
  return nodes.flatMap((node) => {
    if (node.type === 'paragraph') return [node.paragraph.text]
    return node.items.flatMap(({ paragraph, children }) => [
      `${'  '.repeat(paragraph.list.level || 0)}${paragraph.list.marker} ${paragraph.text}`,
      ...plainParagraphs(children),
    ])
  })
}

export function formatAyahForCopy(chapter, ayah, includeTafsir = false) {
  const parts = [`${chapter.name} — ${ayah.id}`, ayah.arabic, ayah.albanian]
  if (includeTafsir) {
    parts.push('Tefsir Es-Saadi')
    const blocks = new Map(chapter.tafsir.map((block) => [block.id, block]))
    for (const id of new Set(ayah.tafsir_ids)) {
      const block = blocks.get(id)
      if (!block) throw new Error(`Missing tafsir: ${id}`)
      if (block.shared) {
        parts.push(`Shpjegim i përbashkët për ajetet ${block.ayahs.join(', ')}`)
      }
      parts.push(...plainParagraphs(documentNodes(block.document)))
    }
  }
  return parts.filter(Boolean).join('\n\n')
}
