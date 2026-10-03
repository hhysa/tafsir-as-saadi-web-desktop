<script setup>
import { computed, ref } from 'vue'
import { BookOpen, Search, Bookmark, X, BookMarked, Leaf, SlidersHorizontal } from 'lucide-vue-next'
import { matchesSurah } from '../../lib/surahNames.js'
const props = defineProps({
  surahs: Array,
  saved: Array,
  recent: Array,
  selectedSurah: Number,
  open: Boolean,
  loaded: Boolean,
})
const emit = defineEmits(['navigate', 'search', 'bookmark'])
const filter = ref('')
const tab = ref('surahs')
const visibleSurahs = computed(() =>
  props.surahs.filter((surah) => matchesSurah(surah, filter.value)),
)
</script>

<template>
  <aside id="library-sidebar" class="sidebar" :class="{ 'is-open': open }" aria-label="Suret">
    <a class="brand" href="#" @click.prevent="emit('navigate', 1)">
      <span class="brand-icon"><BookOpen :size="25" stroke-width="1.5" /></span>
      <span
        ><strong>Tefsir <span>Es-Saadi</span></strong
        ><small>KURANI NË GJUHËN SHQIPE</small></span
      >
    </a>
    <button class="search-trigger" @click="emit('search')">
      <Search :size="17" /><span>Kërko në Kuran</span><kbd>⌘ K</kbd>
    </button>
    <section v-if="recent?.length" class="recent-reading" aria-labelledby="recent-reading-title">
      <h2 id="recent-reading-title">Leximi i fundit</h2>
      <button
        v-for="item in recent.slice(0, 1)"
        :key="item.id"
        class="recent-reading-link"
        @click="emit('navigate', item.surah, item.ayah)"
      >
        <span>{{ item.name }}</span
        ><small>{{ item.id }}</small>
      </button>
    </section>
    <div class="library-tabs" role="tablist" aria-label="Suret">
      <button
        role="tab"
        :aria-selected="tab === 'surahs'"
        :class="{ active: tab === 'surahs' }"
        @click="tab = 'surahs'"
      >
        <BookOpen :size="16" />Suret <span>114</span>
      </button>
      <button
        role="tab"
        :aria-selected="tab === 'saved'"
        :class="{ active: tab === 'saved' }"
        @click="tab = 'saved'"
      >
        <Bookmark :size="15" />Të ruajturat
      </button>
    </div>
    <template v-if="tab === 'surahs'">
      <div class="sidebar-heading">
        <span>TË GJITHA SURET</span><SlidersHorizontal :size="13" />
      </div>
      <div class="surah-filter">
        <Search :size="14" /><input
          v-model="filter"
          aria-label="Filtro suret"
          placeholder="Emri ose numri i sures…"
        /><button v-if="filter" aria-label="Pastro filtrin" @click="filter = ''">
          <X :size="13" />
        </button>
      </div>
      <nav class="surah-list" aria-label="Suret e Kuranit">
        <button
          v-for="surah in visibleSurahs"
          :key="surah.number"
          class="surah-link"
          :class="{ selected: selectedSurah === surah.number }"
          :aria-current="selectedSurah === surah.number ? 'page' : undefined"
          @click="emit('navigate', surah.number)"
        >
          <span class="surah-number">{{ String(surah.number).padStart(2, '0') }}</span>
          <span class="surah-description"
            ><strong>{{ surah.name }}</strong
            ><small>{{ surah.count }} ajete · {{ surah.revelation }}</small></span
          >
          <span v-if="selectedSurah === surah.number" class="current-dot"></span>
        </button>
        <div v-if="!visibleSurahs.length && loaded" class="small-empty">Nuk u gjet asnjë sure.</div>
      </nav>
    </template>
    <div v-else class="saved-list">
      <div class="sidebar-heading">
        <span>KOLEKSIONI JUAJ</span><span>{{ saved.length }}</span>
      </div>
      <div v-if="!saved.length" class="empty-bookmarks">
        <BookMarked :size="30" stroke-width="1.2" />
        <h3>Mbani pranë një ajet</h3>
        <p>Shtypni shenjën e ruajtjes pranë një ajeti për ta gjetur sërish këtu.</p>
      </div>
      <div v-for="item in saved" :key="item.id" class="saved-item">
        <button @click="emit('navigate', item.surah, item.ayah)">
          <strong>{{ item.name }}</strong
          ><small>Ajeti {{ item.ayah }} · {{ item.id }}</small></button
        ><button :aria-label="`Hiq ${item.id} nga të ruajturat`" @click="emit('bookmark', item.id)">
          <X :size="15" />
        </button>
      </div>
    </div>
    <footer class="sidebar-footer">
      <span class="offline-dot"></span><span>Në dispozicion edhe pa internet</span
      ><Leaf :size="14" />
    </footer>
  </aside>
</template>
