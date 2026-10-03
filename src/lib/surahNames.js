import { normalize } from './search.js'

// Arabic title articles, checked against https://quran.com/.
// Apply assimilation by surah identity, not by ambiguous Albanian letters.
const sunPrefixes = new Map([
  ...[4, 16, 24, 27, 53, 78, 79, 110, 114].map((number) => [number, 'EN']),
  ...[9, 52, 64, 65, 66, 81, 86, 95, 102].map((number) => [number, 'ET']),
  ...[13, 30, 55].map((number) => [number, 'ER']),
  ...[26, 42, 91].map((number) => [number, 'ESH']),
  ...[32, 37, 61].map((number) => [number, 'ES']),
  ...[39, 43, 99].map((number) => [number, 'EZ']),
  ...[44, 93].map((number) => [number, 'ED']),
  [51, 'EDH'],
  [92, 'EL'], // Lam is a sun letter: EL-LEJL already represents the doubled L.
])
const withoutArticle = new Set([
  3, 10, 11, 12, 14, 19, 20, 31, 34, 35, 36, 38, 40, 41, 47, 50, 71, 80, 106,
])
const article = /^(EL|EN|ET|ER|ESH|ES|EZ|EDH|ED)[\s-]+/

export function formatSurahName(name, number) {
  const uppercase = name.trim().toLocaleUpperCase('sq')
  const stem = uppercase.replace(article, '')
  if (withoutArticle.has(number)) return stem
  if (Number.isInteger(number) && number >= 1 && number <= 114) {
    return `${sunPrefixes.get(number) || 'EL'}-${stem}`
  }
  return uppercase.replace(article, '$1-')
}

export function matchesSurah(surah, query) {
  // Accept both the corrected title and the spelling in the source material.
  const searchable = (value) => normalize(value).replace(/-/g, ' ')
  return [surah.name, surah.sourceName].some(
    (name) => name && searchable(`${surah.number} ${name}`).includes(searchable(query)),
  )
}
