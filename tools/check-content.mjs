import { readFile, access } from 'node:fs/promises'
import assert from 'node:assert/strict'

const assets = new URL('../public/', import.meta.url)
const readJson = async (name) => JSON.parse(await readFile(new URL(name, assets), 'utf8'))

try {
  const manifest = await readJson('content/manifest.json')
  assert.equal(manifest.surahs.length, 114, 'Expected 114 surahs')
  const ids = new Set()
  for (const [index, surah] of manifest.surahs.entries()) {
    assert.equal(surah.number, index + 1, 'Invalid surah ordering')
    const chapter = await readJson(`content/${surah.number}.json`)
    assert.equal(chapter.number, surah.number)
    assert.equal(chapter.ayahs.length, surah.count)
    const blocks = new Map(chapter.tafsir.map((block) => [block.id, block]))
    for (const [i, ayah] of chapter.ayahs.entries()) {
      assert.equal(ayah.id, `${surah.number}:${i + 1}`)
      assert.ok(ayah.arabic && ayah.albanian && ayah.glyphs?.length, `Missing text: ${ayah.id}`)
      assert.ok(ayah.tafsir_ids?.length, `Missing tafsir: ${ayah.id}`)
      for (const id of ayah.tafsir_ids) {
        assert.ok(blocks.get(id)?.ayahs.includes(i + 1), `Invalid tafsir link: ${ayah.id}`)
      }
      ids.add(ayah.id)
    }
  }
  assert.equal(ids.size, 6236)
  const search = await readJson('content/search.json')
  assert.equal(search.length, ids.size)
  assert.deepEqual(new Set(search.map((ayah) => ayah.id)), ids)
  await access(new URL('fonts/UthmanicHafs1Ver18.woff2', assets))
  await Promise.all(
    Array.from({ length: 604 }, (_, i) =>
      access(new URL(`fonts/qcf-v2/QCF2${String(i + 1).padStart(3, '0')}.ttf`, assets)),
    ),
  )
  console.log('Bundled content verified: 114 surahs, 6,236 ayahs, search index and Arabic fonts.')
} catch (error) {
  console.error(
    'Bundled content is missing or invalid. Copy the complete public/content and public/fonts folders into this app. To refresh them from the original project, run npm run prepare:data there.',
  )
  console.error(error.message)
  process.exitCode = 1
}
