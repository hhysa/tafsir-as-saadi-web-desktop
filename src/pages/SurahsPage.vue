<script setup>
import { computed, ref } from 'vue'
import { Search, ChevronRight } from 'lucide-vue-next'
import { matchesSurah } from '../lib/surahNames.js'
const props = defineProps({ surahs: Array })
const emit = defineEmits(['navigate'])
const filter = ref('')
const visibleSurahs = computed(() =>
  props.surahs.filter((surah) => matchesSurah(surah, filter.value)),
)
</script>

<template>
  <main class="surahs-page" aria-labelledby="surahs-title">
    <div class="surahs-page-inner">
      
      <label class="surahs-page-search">
        <Search :size="20" />
        <input
          v-model="filter"
          type="search"
          aria-label="Kërko një sure"
          placeholder="Emri ose numri i sures…"
        />
      </label>
      <nav class="surahs-grid" aria-label="Të gjitha suret">
        <button
          v-for="surah in visibleSurahs"
          :key="surah.number"
          class="surah-tile"
          @click="emit('navigate', surah.number)"
        >
          <span class="surah-tile-number">{{ String(surah.number).padStart(2, '0') }}</span>
          <span class="surah-tile-description"
            ><strong>{{ surah.name }}</strong
            ><small>{{ surah.count }} ajete · {{ surah.revelation }}</small></span
          >
          <ChevronRight :size="18" />
        </button>
      </nav>
      <p v-if="!visibleSurahs.length" class="surahs-intro" role="status">Nuk u gjet asnjë sure.</p>
    </div>
  </main>
</template>

<style scoped>
.surahs-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 2px;
}
.surahs-page-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.surahs-intro {
  color: var(--muted);
  line-height: 1.6;
}
.surahs-page-search {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--paper);
  padding: 14px;
  margin: 24px 0;
  color: var(--muted);
}
input {
  flex: 1;
  background: transparent;
  border: 0;
  color: var(--ink);
  font-size: 16px;
  padding: 4px;
}
.surahs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 14px;
}
.surah-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--paper);
  text-align: left;
  min-width: 0;
}
.surah-tile:hover {
  background: var(--soft-accent);
  border-color: var(--accent);
}
.surah-tile-number {
  color: var(--accent);
  font-size: 16px;
}
.surah-tile-description {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
strong {
  display: block;
  font-size: 17px;
}
small {
  display: block;
  margin-top: 7px;
  font-size: 13px;
  color: var(--muted);
}
@media (max-width: 720px) {
  .surahs-page {
    padding: 24px 16px;
  }
}
</style>
