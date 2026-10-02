import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { formatAyahForCopy } from '../../src/lib/copyAyah.js'
const chapter = JSON.parse(readFileSync(new URL('../../public/content/1.json', import.meta.url)))

test('Copying an ayah uses Unicode Arabic, translation and reference without tafsir', () => {
  const ayah = chapter.ayahs[0]
  assert.equal(
    formatAyahForCopy(chapter, ayah),
    `${chapter.name} — 1:1\n\n${ayah.arabic}\n\n${ayah.albanian}`,
  )
})

test('Copying tafsir includes all linked commentary once, shared labels and list markers', () => {
  const ayah = chapter.ayahs[0]
  const text = formatAyahForCopy(
    chapter,
    { ...ayah, tafsir_ids: [...ayah.tafsir_ids, ayah.tafsir_ids[0]] },
    true,
  )
  assert.equal(text, formatAyahForCopy(chapter, ayah, true))
  assert.ok(text.includes('Shpjegim i përbashkët për ajetet 1, 3'))
  for (const block of chapter.tafsir.filter((b) => ayah.tafsir_ids.includes(b.id))) {
    for (const paragraph of block.document) {
      assert.ok(text.includes(paragraph.text))
      if (paragraph.list) assert.ok(text.includes(`${paragraph.list.marker} ${paragraph.text}`))
    }
  }
  assert.throws(() => formatAyahForCopy({ ...chapter, tafsir: [] }, ayah, true), /Missing tafsir/)
})
