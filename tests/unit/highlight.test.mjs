import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchRanges, highlightedRuns } from '../../src/lib/highlight.js'

test('Search highlights preserve accents, Arabic vowels and formatting boundaries', () => {
  const text = 'MËSHIRË dhe me\u0308shire\u0308'
  assert.deepEqual(matchRanges(text, 'meshire'), [
    [0, 7],
    [12, text.length],
  ])
  const arabic = 'بِسْمِ ٱللَّهِ'
  assert.deepEqual(matchRanges(arabic, 'بسم'), [[0, 6]])
  assert.deepEqual(matchRanges('2:255', '2:255'), [])
  assert.deepEqual(matchRanges('hello', ''), [])
  assert.deepEqual(matchRanges('😀 mëshirë', 'meshire'), [[3, 10]])
  const parts = highlightedRuns(
    '',
    [
      { text: 'Më', bold: true },
      { text: 'shirë!', italic: true },
    ],
    'meshire',
  )
  assert.deepEqual(
    parts.map((p) => [p.text, p.highlighted]),
    [
      ['Më', true],
      ['shirë', true],
      ['!', false],
    ],
  )
  assert.equal(parts[0].bold, true)
  assert.equal(parts[1].italic, true)
  assert.deepEqual(matchRanges('mëshirë', 'meshi meshire'), [[0, 7]])
  assert.deepEqual(matchRanges('Mëshira dhe durimi', 'meshir durim'), [
    [0, 6],
    [12, 17],
  ])
})
