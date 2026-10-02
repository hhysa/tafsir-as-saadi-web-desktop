import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readPreferences, rememberReading } from '../../src/lib/preferences.js'

test('Damaged and out-of-range preferences recover to readable defaults', () => {
  assert.equal(readPreferences({ getItem: () => '{broken' }).surah, 1)
  const preferences = readPreferences({
    getItem: () =>
      JSON.stringify({
        surah: 500,
        ayah: -1,
        theme: 'invalid',
        scale: 100,
        bookmarks: ['1:1', '1:1', '<script>'],
        showArabic: false,
        showAlbanian: false,
      }),
  })
  assert.equal(preferences.surah, 1)
  assert.equal(preferences.ayah, 1)
  assert.equal(preferences.scale, 1)
  assert.equal(preferences.showAlbanian, true)
  assert.deepEqual(preferences.bookmarks, ['1:1'])
})

test('Open-all tafsir is opt-in and only accepts a saved boolean', () => {
  for (const value of [undefined, false, 'true', 1, null, true]) {
    const preferences = readPreferences({ getItem: () => JSON.stringify({ openAllTafsir: value }) })
    assert.equal(preferences.openAllTafsir, value === true)
  }
})

test('Recent reading keeps three unique locations, newest first, and validates saved data', () => {
  assert.deepEqual(rememberReading(['1:1', '2:3', '3:4'], '2:3'), ['2:3', '1:1', '3:4'])
  assert.deepEqual(rememberReading(['1:1', '2:3', '3:4'], '4:5'), ['4:5', '1:1', '2:3'])
  assert.deepEqual(
    readPreferences({
      getItem: () =>
        JSON.stringify({ recentRead: ['0:1', '115:1', null, '1:1', '1:1', '2:3', '3:4', '4:5'] }),
    }).recentRead,
    ['1:1', '2:3', '3:4'],
  )
  assert.deepEqual(readPreferences({ getItem: () => '{}' }).recentRead, [])
})
