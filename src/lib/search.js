export function normalize(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ـ/g, '')
    .toLocaleLowerCase('sq')
    .trim()
}

export function searchAyahs(rows, query) {
  const q = normalize(query)
  if (!q) return []
  const reference = q.match(/^(\d+)\s*[:.]\s*(\d+)$/)
  if (reference)
    return rows.filter((a) => a.surah === Number(reference[1]) && a.ayah === Number(reference[2]))
  const terms = q.split(/\s+/)
  return rows.filter((a) =>
    terms.every((term) => normalize(`${a.albanian} ${a.arabic}`).includes(term)),
  )
}
