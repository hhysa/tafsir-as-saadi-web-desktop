import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { readPreferences, rememberReading } from '../lib/preferences.js'
import { documentNodes } from '../lib/documentLists.js'
import { formatAyahForCopy } from '../lib/copyAyah.js'
import { copyText } from '../services/clipboard.js'
import { fetchContent } from '../services/content.js'
import { formatSurahName } from '../lib/surahNames.js'

export function useQuranReader() {
  const preferences = ref(readPreferences(window.localStorage))
  const manifest = ref(null)
  const chapter = ref(null)
  const searchQuery = ref('')
  const selected = ref(preferences.value.ayah)
  const expandedAyahs = ref(new Set())
  const loading = ref(true)
  const error = ref('')
  const notice = ref('')
  const copyingAyah = ref(null)
  const mobileLayout = window.matchMedia('(max-width: 720px)')
  const sidebarOpen = ref(!mobileLayout.matches)
  function syncSidebarLayout() {
    sidebarOpen.value = !mobileLayout.matches
  }
  onMounted(() => mobileLayout.addEventListener('change', syncSidebarLayout))
  onUnmounted(() => mobileLayout.removeEventListener('change', syncSidebarLayout))
  const reader = ref(null)
  let requestId = 0
  let noticeTimeout
  let readingTimeout

  const surahs = computed(() => manifest.value?.surahs || [])
  const expandedBlocks = computed(() => {
    const blocks = new Map((chapter.value?.tafsir || []).map((block) => [block.id, block]))
    const prepared = new Map()
    return new Map(
      (chapter.value?.ayahs || [])
        .filter((ayah) => expandedAyahs.value.has(ayah.ayah))
        .map((ayah) => [
          ayah.ayah,
          ayah.tafsir_ids.map((id) => {
            if (!prepared.has(id)) {
              const block = blocks.get(id)
              prepared.set(id, { ...block, nodes: documentNodes(block.document) })
            }
            return prepared.get(id)
          }),
        ]),
    )
  })
  function resetTafsir() {
    expandedAyahs.value = new Set(
      preferences.value.openAllTafsir ? chapter.value?.ayahs.map((a) => a.ayah) : [],
    )
  }
  watch(() => preferences.value.openAllTafsir, resetTafsir)

  async function toggleTafsir(number) {
    const currentChapter = chapter.value
    if (expandedAyahs.value.has(number)) expandedAyahs.value.delete(number)
    else if (preferences.value.openAllTafsir) expandedAyahs.value.add(number)
    else expandedAyahs.value = new Set([number])
    selected.value = number
    preferences.value.ayah = number
    recordReading(number)
    await nextTick()
    // Collapsing the previous passage changes the clicked card's position.
    // Bring its button and the start of the new commentary into view together.
    if (chapter.value === currentChapter && expandedAyahs.value.has(number)) {
      document
        .querySelector(`#ayah-${number} .tafsir-link`)
        ?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }
  function recordReading(number) {
    if (!chapter.value || loading.value) return
    const id = `${chapter.value.number}:${number}`
    if (preferences.value.recentRead[0] !== id) {
      preferences.value.recentRead = rememberReading(preferences.value.recentRead, id)
    }
  }
  function trackReadingScroll() {
    clearTimeout(readingTimeout)
    if (loading.value) return
    const token = requestId
    readingTimeout = setTimeout(() => {
      if (loading.value || token !== requestId || !reader.value) return
      const viewport = reader.value.getBoundingClientRect()
      const line = viewport.top + Math.min(120, viewport.height / 3)
      const cards = [...reader.value.querySelectorAll('.ayah-card')]
      const card = cards.find((element) => {
        const rect = element.getBoundingClientRect()
        return rect.top <= line && rect.bottom > line
      })
      if (card) {
        const number = Number(card.id.slice(5))
        selected.value = number
        preferences.value.ayah = number
        recordReading(number)
      }
    }, 1200)
  }
  const recent = computed(() =>
    preferences.value.recentRead
      .map((id) => {
        const [surah, ayah] = id.split(':').map(Number)
        return { id, surah, ayah, name: surahs.value.find((s) => s.number === surah)?.name }
      })
      .filter((entry) => entry.name),
  )
  const saved = computed(() =>
    preferences.value.bookmarks
      .map((id) => {
        const [surah, ayah] = id.split(':').map(Number)
        return { id, surah, ayah, name: surahs.value.find((s) => s.number === surah)?.name }
      })
      .filter((a) => a.name),
  )
  watch(
    preferences,
    (value) => {
      document.documentElement.dataset.theme = value.theme
      try {
        localStorage.setItem('tefsir.preferences.v1', JSON.stringify(value))
      } catch {
        notify('Preferencat nuk mund të ruhen në këtë pajisje.')
      }
    },
    { deep: true, immediate: true },
  )
  async function initialize() {
    error.value = ''
    loading.value = true
    try {
      manifest.value = await fetchContent('manifest')
      manifest.value.surahs = manifest.value.surahs.map((surah) => ({
        ...surah,
        sourceName: surah.name,
        name: formatSurahName(surah.name, surah.number),
      }))
      preferences.value.bookmarks = preferences.value.bookmarks.filter((id) => {
        const [s, a] = id.split(':').map(Number)
        return a > 0 && a <= (surahs.value.find((ch) => ch.number === s)?.count || 0)
      })
      preferences.value.recentRead = preferences.value.recentRead.filter((id) => {
        const [s, a] = id.split(':').map(Number)
        return a <= (surahs.value.find((ch) => ch.number === s)?.count || 0)
      })
      await openSurah(preferences.value.surah, preferences.value.ayah)
    } catch {
      error.value = 'Nuk u ngarkuan të dhënat e Kuranit. Provoni përsëri.'
      loading.value = false
    }
  }

  async function openSurah(number, ayah = 1, query = '') {
    if (mobileLayout.matches) sidebarOpen.value = false
    error.value = ''
    clearTimeout(readingTimeout)
    const token = ++requestId
    loading.value = true
    try {
      const content = await fetchContent(number)
      if (token !== requestId) return
      searchQuery.value = query
      chapter.value = { ...content, name: formatSurahName(content.name, content.number) }
      resetTafsir()
      selected.value = Math.min(Math.max(1, ayah), content.count)
      preferences.value.surah = number
      preferences.value.ayah = selected.value
      loading.value = false
      recordReading(selected.value)
      await nextTick()
      if (selected.value === 1) reader.value?.scrollTo({ top: 0 })
      else scrollToAyah()
    } catch {
      if (token !== requestId) return
      error.value =
        'Kjo sure nuk u ngarkua. Kontrolloni skedarët e aplikacionit dhe provoni përsëri.'
      loading.value = false
    }
  }

  function scrollToAyah() {
    document
      .getElementById(`ayah-${selected.value}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function selectAyah(number) {
    selected.value = number
    preferences.value.ayah = number
    recordReading(number)
    await nextTick()
    scrollToAyah()
  }

  function toggleBookmark(id) {
    const list = preferences.value.bookmarks
    preferences.value.bookmarks = list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id]
    notify(list.includes(id) ? 'Ajeti u hoq nga të ruajturat.' : 'Ajeti u ruajt.')
  }

  async function copyAyah(ayah, includeTafsir = false) {
    if (copyingAyah.value) return
    copyingAyah.value = ayah.id
    try {
      await copyText(formatAyahForCopy(chapter.value, ayah, includeTafsir))
      notify(includeTafsir ? 'Ajeti dhe tefsiri u kopjuan.' : 'Ajeti u kopjua.')
    } catch {
      notify('Kopjimi nuk u krye. Provoni përsëri ose përzgjidhni tekstin për ta kopjuar.')
    } finally {
      copyingAyah.value = null
    }
  }

  async function shareAyah(ayah) {
    if (copyingAyah.value) return
    copyingAyah.value = ayah.id
    try {
      const text = formatAyahForCopy(chapter.value, ayah)
      if (navigator.share) {
        await navigator.share({ title: `${chapter.value.name} — ${ayah.id}`, text })
      } else {
        await copyText(text)
        notify('Ajeti u kopjua. Ngjiteni aty ku dëshironi ta shpërndani.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') notify('Shpërndarja nuk u krye. Provoni kopjimin e ajetit.')
    } finally {
      copyingAyah.value = null
    }
  }

  function notify(text) {
    notice.value = text
    clearTimeout(noticeTimeout)
    noticeTimeout = setTimeout(() => {
      notice.value = ''
    }, 3000)
  }

  onMounted(initialize)
  onUnmounted(() => {
    requestId++
    clearTimeout(noticeTimeout)
    clearTimeout(readingTimeout)
  })
  return {
    preferences,
    searchQuery,
    manifest,
    chapter,
    selected,
    expandedAyahs,
    expandedBlocks,
    loading,
    error,
    notice,
    sidebarOpen,
    surahs,
    saved,
    recent,
    trackReadingScroll,
    reader,
    initialize,
    openSurah,
    selectAyah,
    toggleBookmark,
    toggleTafsir,
    copyAyah,
    shareAyah,
    copyingAyah,
  }
}
