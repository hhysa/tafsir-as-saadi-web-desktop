<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { BookOpen, Check, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import SurahsPage from './pages/SurahsPage.vue'
import LibrarySidebar from './components/layout/LibrarySidebar.vue'
import ReadingLoader from './components/layout/ReadingLoader.vue'
import ReaderTopbar from './components/layout/ReaderTopbar.vue'
import ChapterHeader from './components/reader/ChapterHeader.vue'
import AyahCard from './components/reader/AyahCard.vue'
import TafsirText from './components/reader/TafsirText.vue'
import SearchDialog from './components/dialogs/SearchDialog.vue'
import SettingsDialog from './components/dialogs/SettingsDialog.vue'
import { documentNodes } from './lib/documentLists.js'
import { useQuranReader } from './composables/useQuranReader.js'

const {
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
  openSurah: loadSurah,
  selectAyah,
  toggleBookmark,
  toggleTafsir,
  copyAyah,
  shareAyah,
  copyingAyah,
} = useQuranReader()
const showSurahs = ref(window.location.hash === '#/surahs')
async function syncPage() {
  showSurahs.value = window.location.hash === '#/surahs'
  if (window.matchMedia('(max-width: 720px)').matches) sidebarOpen.value = false
  if (!showSurahs.value && chapter.value && !loading.value) await selectAyah(selected.value)
}
function openSurah(...args) {
  if (showSurahs.value) {
    window.history.pushState(null, '', '#/read')
    showSurahs.value = false
  }
  return loadSurah(...args)
}
onMounted(() => window.addEventListener('hashchange', syncPage))
onUnmounted(() => window.removeEventListener('hashchange', syncPage))
const searchDialog = ref(null)
const settingsDialog = ref(null)
function openSearch() {
  searchDialog.value?.open()
}
function keyboard(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (!settingsDialog.value?.isOpen()) openSearch()
  }
  if (event.key === 'Escape') sidebarOpen.value = false
}
onMounted(() => document.addEventListener('keydown', keyboard))
onUnmounted(() => document.removeEventListener('keydown', keyboard))
</script>

<template>
  <div
    class="app-shell"
    :style="{ '--reading-scale': preferences.scale, '--albanian-scale': preferences.albanianScale }"
  >
    <button
      v-if="sidebarOpen"
      class="mobile-scrim"
      aria-label="Mbyll menynë"
      @click="sidebarOpen = false"
    ></button>
    <LibrarySidebar
      :surahs="surahs"
      :saved="saved"
      :recent="recent"
      :selected-surah="chapter?.number"
      :open="sidebarOpen"
      :loaded="Boolean(manifest)"
      @navigate="openSurah"
      @search="openSearch"
      @bookmark="toggleBookmark"
    />

    <div class="workspace">
      <ReaderTopbar
        :chapter-name="chapter?.name"
        :directory="showSurahs"
        :sidebar-open="sidebarOpen"
        @menu="sidebarOpen = !sidebarOpen"
        @search="openSearch"
        @settings="settingsDialog.open()"
      />
      <ReadingLoader v-if="loading" />
      <div v-else-if="error" class="page-state" role="alert">
        <BookOpen :size="34" />
        <h2>Nuk mund të hapet leximi</h2>
        <p>{{ error }}</p>
        <button class="primary-button" @click="initialize">Provo përsëri</button>
      </div>
      <SurahsPage v-else-if="showSurahs" :surahs="surahs" @navigate="openSurah" />
      <div v-else-if="chapter" class="reading-layout">
        <main ref="reader" class="reader" id="reader" @scroll.passive="trackReadingScroll">
          <div class="reader-inner">
            <ChapterHeader :chapter="chapter" :selected="selected" @select="selectAyah" />
            <div class="document-reading" aria-label="Ajetet dhe tefsiri">
              <AyahCard
                v-for="ayah in chapter.ayahs"
                :key="ayah.id"
                :ayah="ayah"
                :copying="copyingAyah === ayah.id"
                :query="searchQuery"
                :bookmarked="preferences.bookmarks.includes(ayah.id)"
                :show-arabic="preferences.showArabic"
                :show-albanian="preferences.showAlbanian"
                :expanded="expandedAyahs.has(ayah.ayah)"
                :blocks="expandedBlocks.get(ayah.ayah) || []"
                @bookmark="toggleBookmark"
                @toggle="toggleTafsir"
                @copy="copyAyah"
                @share="shareAyah"
              />
              <details v-if="chapter.benefits" :key="chapter.number" class="benefits">
                <summary>{{ chapter.benefits.title }}</summary>
                <TafsirText :nodes="documentNodes(chapter.benefits.document)" />
              </details>
            </div>
            <div class="chapter-navigation">
              <button
                :disabled="chapter.number === 1"
                class="quiet-button"
                @click="openSurah(chapter.number - 1)"
              >
                <ChevronLeft :size="16" />Surja e mëparshme</button
              ><button
                :disabled="chapter.number === 114"
                class="quiet-button"
                @click="openSurah(chapter.number + 1)"
              >
                Surja pasuese<ChevronRight :size="16" />
              </button>
            </div>
            <p class="reading-footer">Lexoni me qetësi. Meditoni me zemër.</p>
          </div>
        </main>
      </div>
    </div>

    <SearchDialog ref="searchDialog" :surahs="surahs" @navigate="openSurah" />

    <SettingsDialog ref="settingsDialog" v-model="preferences" />
    <div v-if="notice" class="toast" role="status"><Check :size="16" />{{ notice }}</div>
  </div>
</template>
