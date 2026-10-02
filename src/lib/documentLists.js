function sliceRuns(runs, start, end = Infinity) {
  let offset = 0
  return runs?.flatMap((run) => {
    const from = Math.max(0, start - offset)
    const to = Math.min(run.text.length, end - offset)
    offset += run.text.length
    return to > from ? [{ ...run, text: run.text.slice(from, to) }] : []
  })
}

// Reviewed inline enumeration in Al-Kehf 18:1 (Word source paragraph 98).
// Explicit boundaries keep the explanation after item 2 outside the list.
function splitReviewedInlineList(p) {
  const first = '1.Ai nuk është i shtrembëruar në asnjë aspekt.'
  const second =
    '2. Ai është i vyer dhe plot drejtësi, sqarues i rrugës së drejtë dhe mundësues i saj.'
  const enumeration = `${first} ${second}`
  const start = p.text?.indexOf(enumeration) ?? -1
  if (
    p.translation ||
    p.list ||
    start < 0 ||
    !p.text.slice(0, start).endsWith('një Libër i plotë, pa të meta: ') ||
    !p.text.slice(start + enumeration.length).startsWith(' Përshkrimi i parë tregon')
  )
    return [p]
  const fragment = (from, to, list = null) => ({
    ...p,
    key: `${p.index}:inline-${from}`,
    text: p.text.slice(from, to),
    runs: sliceRuns(p.runs, from, to),
    list,
  })
  const metadata = (value) => ({
    id: `inline-kehf-${p.index}`,
    level: 0,
    kind: 'ordered',
    format: 'decimal',
    value,
    marker: `${value}.`,
  })
  return [
    fragment(0, start),
    fragment(start + 2, start + first.length, metadata(1)),
    fragment(start + first.length + 4, start + enumeration.length, metadata(2)),
    fragment(start + enumeration.length, p.text.length),
  ]
}

// Some Word lists have typed numbers rather than numbering definitions.
// Require consecutive items, so isolated numbers in prose stay untouched.
function withTypedLists(paragraphs) {
  const result = [...paragraphs]
  const match = (p) => !p.translation && !p.list && /^(\d{1,3})([.)])\s+\S/u.exec(p.text || '')
  for (let i = 0; i < paragraphs.length; i++) {
    const first = match(paragraphs[i])
    if (!first) continue
    let end = i + 1
    while (end < paragraphs.length) {
      const next = match(paragraphs[end])
      if (!next || next[2] !== first[2] || Number(next[1]) !== Number(first[1]) + end - i) break
      end++
    }
    if (end - i < 2) continue
    for (let j = i; j < end; j++) {
      const p = paragraphs[j]
      const prefix = match(p)
      const marker = prefix[1] + prefix[2]
      const length = prefix[0].length - 1
      result[j] = {
        ...p,
        text: p.text.slice(length),
        runs: sliceRuns(p.runs, length),
        list: {
          id: `typed-${paragraphs[i].index}`,
          level: 0,
          kind: 'ordered',
          format: 'decimal',
          value: Number(prefix[1]),
          marker,
          marker_runs: sliceRuns(p.runs, 0, marker.length),
        },
      }
    }
    i = end - 1
  }
  return result
}

// Group adjacent Word list paragraphs in their original order.
export function documentNodes(paragraphs) {
  const nodes = []
  const stack = []
  for (const paragraph of withTypedLists(paragraphs.flatMap(splitReviewedInlineList))) {
    const meta = paragraph.translation ? null : paragraph.list
    if (!meta) {
      stack.length = 0
      nodes.push({ type: 'paragraph', paragraph, key: paragraph.key ?? paragraph.index })
      continue
    }
    while (stack.length && stack.at(-1).level > meta.level) stack.pop()
    let current = stack.at(-1)
    if (
      current &&
      current.level === meta.level &&
      (current.id !== meta.id || current.kind !== meta.kind)
    ) {
      stack.pop()
      current = stack.at(-1)
    }
    if (!current || current.level !== meta.level) {
      const parent = current?.items.at(-1)?.children || nodes
      current = {
        type: 'list',
        key: paragraph.key ?? paragraph.index,
        level: meta.level,
        id: meta.id,
        kind: meta.kind,
        items: [],
      }
      parent.push(current)
      stack.push(current)
    }
    current.items.push({ paragraph, children: [] })
  }
  return nodes
}
