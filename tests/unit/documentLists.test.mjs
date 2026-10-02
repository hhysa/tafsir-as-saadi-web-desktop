import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { documentNodes } from '../../src/lib/documentLists.js'

test('Al-Kehf first ayah separates its two inline points from surrounding commentary', () => {
  const chapter = JSON.parse(
    readFileSync(new URL('../../public/content/18.json', import.meta.url), 'utf8'),
  )
  const ayah = chapter.ayahs[0]
  const block = chapter.tafsir.find((block) => ayah.tafsir_ids.includes(block.id))
  const original = JSON.stringify(block.document)
  const nodes = documentNodes(block.document)
  assert.deepEqual(
    nodes.map((node) => node.type),
    ['paragraph', 'list', 'paragraph'],
  )
  assert.equal(nodes[1].kind, 'ordered')
  assert.deepEqual(
    nodes[1].items.map((item) => item.paragraph.text),
    [
      'Ai nuk është i shtrembëruar në asnjë aspekt.',
      'Ai është i vyer dhe plot drejtësi, sqarues i rrugës së drejtë dhe mundësues i saj.',
    ],
  )
  const [first, second] = nodes[1].items.map((item) => item.paragraph)
  assert.equal(
    nodes[0].paragraph.text +
      first.list.marker +
      first.text +
      ' ' +
      second.list.marker +
      ' ' +
      second.text +
      nodes[2].paragraph.text,
    block.document[0].text,
  )
  for (const p of [nodes[0].paragraph, first, second, nodes[2].paragraph]) {
    assert.equal(p.runs.map((run) => run.text).join(''), p.text)
  }
  assert.equal(nodes[0].paragraph.runs[0].italic, true)
  assert.equal(new Set(nodes.map((node) => node.key)).size, 3)
  assert.equal(JSON.stringify(block.document), original)
})

test('Word list grouping preserves nesting, separate lists and source order', () => {
  const item = (index, id, level = 0, kind = 'ordered') => ({
    index,
    list: { id, level, kind, value: index, marker: `${index}.` },
  })
  const rows = [
    item(1, 'a'),
    item(2, 'a', 1),
    item(3, 'a', 1),
    item(4, 'a'),
    { index: 5 },
    item(6, 'a'),
    item(7, 'b', 0, 'unordered'),
  ]
  const nodes = documentNodes(rows)
  assert.equal(nodes.length, 4)
  assert.equal(nodes[0].items.length, 2)
  assert.equal(nodes[0].items[0].children[0].items.length, 2)
  assert.equal(nodes[3].kind, 'unordered')
  const flatten = (nodes) =>
    nodes.flatMap((n) =>
      n.type === 'paragraph'
        ? [n.paragraph.index]
        : n.items.flatMap((i) => [i.paragraph.index, ...flatten(i.children)]),
    )
  assert.deepEqual(
    flatten(nodes),
    rows.map((p) => p.index),
  )
})

test('Al-Kehf renders typed numbers and Word numbering as ordered tafsir lists', () => {
  const chapter = JSON.parse(
    readFileSync(new URL('../../public/content/18.json', import.meta.url), 'utf8'),
  )
  const paragraphs = chapter.tafsir.flatMap((block) => block.document)
  const original = JSON.stringify(paragraphs)
  const lists = documentNodes(paragraphs).filter((node) => node.type === 'list')
  const typed = lists.find((node) => node.items[0].paragraph.index === 307)
  assert.equal(typed.kind, 'ordered')
  assert.deepEqual(
    typed.items.map((item) => item.paragraph.list.marker),
    ['1.', '2.'],
  )
  assert.equal(typed.items[0].paragraph.list.marker_runs[0].bold, true)
  for (const { paragraph } of typed.items) {
    assert.equal(
      paragraph.list.marker + ' ' + paragraph.text,
      paragraphs.find((p) => p.index === paragraph.index).text,
    )
    assert.equal(paragraph.runs.map((run) => run.text).join(''), paragraph.text)
  }
  const word = lists.find((node) => node.items[0].paragraph.index === 424)
  assert.deepEqual(
    word.items.map((item) => item.paragraph.list.value),
    Array.from({ length: 37 }, (_, i) => i + 1),
  )
  assert.equal(JSON.stringify(paragraphs), original)
})

test('Typed list detection preserves formatting and leaves translations and isolated numbers alone', () => {
  const rows = [
    {
      index: 1,
      text: '1. First',
      runs: [
        { text: '1', bold: true },
        { text: '. First', italic: true },
      ],
    },
    { index: 2, text: '2. Second', runs: [{ text: '2. Second', bold: true }] },
    { index: 3, text: '7. An isolated reference' },
    { index: 4, text: '1. Translation', translation: true },
    { index: 5, text: '2. Translation', translation: true },
  ]
  const nodes = documentNodes(rows)
  assert.equal(nodes.length, 4)
  assert.deepEqual(nodes[0].items[0].paragraph.runs, [{ text: 'First', italic: true }])
  assert.deepEqual(nodes[0].items[1].paragraph.runs, [{ text: 'Second', bold: true }])
  assert.ok(nodes.slice(1).every((node) => node.type === 'paragraph'))
})
