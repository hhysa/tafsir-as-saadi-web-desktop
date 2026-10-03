<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Search, X, ArrowRight } from 'lucide-vue-next'
import RichText from '../text/RichText.vue'
import { matchRanges } from '../../lib/highlight.js'
import { searchAyahs } from '../../lib/search.js'
import { fetchContent } from '../../services/content.js'
defineProps({ surahs: Array })
const emit = defineEmits(['navigate'])
const searchDialog = ref(null)
const searchInput = ref(null)
const query = ref('')
const searchRows = ref([])
const searchLoading = ref(false)
const searchError = ref('')
const resultLimit = ref(30)
let searchPromise
const results = computed(() => searchAyahs(searchRows.value, query.value))
watch(query, () => {
  resultLimit.value = 30
})
async function openSearch() {
  searchDialog.value.showModal()
  await nextTick()
  searchInput.value?.focus()
  if (searchRows.value.length || searchPromise) return
  searchLoading.value = true
  searchError.value = ''
  searchPromise = fetchContent('search')
  try {
    searchRows.value = await searchPromise
  } catch {
    searchError.value = 'Kërkimi nuk u ngarkua. Mbylleni dhe provoni përsëri.'
  } finally {
    searchLoading.value = false
    searchPromise = null
  }
}

function openResult(result) {
  searchDialog.value.close()
  emit('navigate', result.surah, result.ayah, query.value)
}

defineExpose({ open: openSearch })
</script>

<template>
  <dialog
    ref="searchDialog"
    class="search-dialog"
    aria-labelledby="search-title"
    @click="
      (event) => {
        if (event.target === searchDialog) searchDialog.close()
      }
    "
  >
    <div class="dialog-header">
      <h2 id="search-title">Kërko në Kuran</h2>
      <button class="icon-button" aria-label="Mbyll kërkimin" @click="searchDialog.close()">
        <X :size="20" />
      </button>
    </div>
    <div class="global-search">
      <Search :size="21" /><input
        ref="searchInput"
        v-model="query"
        aria-label="Kërkimi në Kuran"
        placeholder="Një fjalë, një frazë ose 2:255…"
      />
    </div>
    <p class="search-hint">Kërkoni në tekstin shqip ose arabisht të të gjitha sureve.</p>
    <div class="search-results">
      <p v-if="searchLoading" class="small-empty" role="status">Po përgatitet kërkimi…</p>
      <p v-else-if="searchError" class="small-empty" role="alert">{{ searchError }}</p>
      <div v-else-if="!query.trim()" class="search-empty">
        <Search :size="32" stroke-width="1" />
        
        <p>Provoni “mëshirë”, “durim” ose numrin e një ajeti.</p>
      </div>
      <template v-else
        ><p class="result-count">{{ results.length }} rezultate</p>
        <p v-if="!results.length" class="small-empty">
          Nuk u gjet asnjë ajet. Provoni një fjalë tjetër.
        </p>
        <button
          v-for="result in results.slice(0, resultLimit)"
          :key="result.id"
          class="search-result"
          @click="openResult(result)"
        >
          <span
            >{{ surahs.find((s) => s.number === result.surah)?.name }} <b>{{ result.id }}</b></span
          >
          <p><RichText :text="result.albanian" :query="query" /></p>
          <p v-if="matchRanges(result.arabic, query).length" lang="ar" dir="rtl">
            <RichText :text="result.arabic" :query="query" />
          </p>
          <ArrowRight :size="16" /></button
        ><button
          v-if="results.length > resultLimit"
          class="quiet-button load-more"
          @click="resultLimit += 30"
        >
          Shfaq më shumë rezultate
        </button></template
      >
    </div>
  </dialog>
</template>
