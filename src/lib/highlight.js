import { normalize } from './search.js'

export function matchRanges(text = '', query = '') {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery || /^\d+\s*[:.]\s*\d+$/.test(normalizedQuery)) return []
  let searchable = ''
  const offsets = []
  let offset = 0
  for (const character of text) {
    // Preserve spaces while using the same accent and vowel normalization as search.
    const normalized = /\s/u.test(character) ? character : normalize(character)
    for (let i = 0; i < normalized.length; i++) {
      searchable += normalized[i]
      offsets.push([offset, offset + character.length])
    }
    if (!normalized && offsets.length) offsets.at(-1)[1] = offset + character.length
    offset += character.length
  }
  const ranges = []
  for (const term of new Set(normalizedQuery.split(/\s+/))) {
    let start = searchable.indexOf(term)
    while (start !== -1) {
      ranges.push([offsets[start][0], offsets[start + term.length - 1][1]])
      start = searchable.indexOf(term, start + 1)
    }
  }
  const merged = []
  for (const range of ranges.sort((a, b) => a[0] - b[0])) {
    if (merged.length && range[0] <= merged.at(-1)[1]) {
      merged.at(-1)[1] = Math.max(merged.at(-1)[1], range[1])
    } else merged.push([...range])
  }
  return merged
}

export function highlightedRuns(text, runs, query) {
  const source = runs?.length ? runs : [{ text: text || '' }]
  const ranges = matchRanges(source.map((run) => run.text).join(''), query)
  let offset = 0
  return source.flatMap((run) => {
    const start = offset
    const end = (offset += run.text.length)
    const boundaries = new Set([start, end])
    for (const [from, to] of ranges) {
      if (from > start && from < end) boundaries.add(from)
      if (to > start && to < end) boundaries.add(to)
    }
    const points = [...boundaries].sort((a, b) => a - b)
    return points.slice(0, -1).map((from, i) => ({
      ...run,
      text: run.text.slice(from - start, points[i + 1] - start),
      highlighted: ranges.some(([a, b]) => from >= a && from < b),
    }))
  })
}
