import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalize, searchAyahs } from '../../src/lib/search.js'

test('Albanian accents and Arabic vowel marks do not block search', () => {
  assert.equal(normalize('MËSHIRË'), 'meshire')
  const rows = [
    {
      surah: 1,
      ayah: 1,
      albanian: 'Me emrin e Allahut, të Gjithmëshirshmit',
      arabic: 'بِسْمِ ٱللَّهِ',
    },
  ]
  assert.equal(searchAyahs(rows, 'gjithmeshirshmit').length, 1)
  assert.equal(searchAyahs(rows, 'بسم الله').length, 1)
  assert.equal(searchAyahs(rows, '1:1').length, 1)
  assert.equal(searchAyahs(rows, '2:1').length, 0)
  assert.equal(searchAyahs(rows, 'emrin mungon').length, 0)
})
