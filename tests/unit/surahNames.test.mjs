import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { formatSurahName, matchesSurah } from '../../src/lib/surahNames.js'

const surahs = JSON.parse(
  readFileSync(new URL('../../public/content/manifest.json', import.meta.url)),
).surahs

test('Arabic sun letters assimilate and moon letters retain EL', () => {
  const expected = {
    1: 'EL-FATIHA',
    4: 'EN-NISA',
    26: 'ESH-SHUARA',
    32: 'ES-SEXHDE',
    42: 'ESH-SHÛRÂ',
    43: 'EZ-ZUHRUF',
    44: 'ED-DUHAN',
    45: 'EL-XHATHIJE',
    49: 'EL-HUXHURAT',
    51: 'EDH-DHARIJAT',
    52: 'ET-TUR',
    53: 'EN-NEXHM',
    54: 'EL-KAMER',
    56: 'EL-UAKIAH',
    58: 'EL-MUXHADELE',
    59: 'EL-HASHR',
    61: 'ES-SAFF',
    64: 'ET-TEGABUN',
    66: 'ET-TAHRIM',
    78: 'EN-NEBE’',
    92: 'EL-LEJL',
    94: 'EL-INSHIRAH',
  }
  for (const [number, name] of Object.entries(expected)) {
    assert.equal(formatSurahName(surahs[number - 1].name, Number(number)), name)
  }
})

test('titles without the Arabic article do not gain one', () => {
  for (const [number, name] of [
    [3, 'AL IMRAN'],
    [34, "SEBE'E"],
    [35, 'FATIR'],
    [38, 'SAD'],
    [40, 'GAFIR'],
    [50, 'KAF'],
    [106, 'KUREJSH'],
  ]) {
    assert.equal(formatSurahName(surahs[number - 1].name, number), name)
  }
})

test('all 114 titles remain uppercase, stable and searchable by original or corrected name', () => {
  assert.equal(surahs.length, 114)
  for (const surah of surahs) {
    const name = formatSurahName(surah.name, surah.number)
    const entry = { ...surah, name, sourceName: surah.name }
    assert.equal(name, name.toLocaleUpperCase('sq'))
    assert.equal(formatSurahName(name, surah.number), name)
    assert(matchesSurah(entry, surah.name))
    assert(matchesSurah(entry, name))
    assert(matchesSurah(entry, name.replaceAll('-', ' ')))
  }
})
