<script setup>
import { BookOpen, Bookmark } from 'lucide-vue-next'
import AyahActions from './AyahActions.vue'
import QuranText from '../text/QuranText.vue'
import RichText from '../text/RichText.vue'
import TafsirText from './TafsirText.vue'
defineProps({
  ayah: Object,
  copying: Boolean,
  query: String,
  bookmarked: Boolean,
  showArabic: Boolean,
  showAlbanian: Boolean,
  expanded: Boolean,
  blocks: Array,
})
const emit = defineEmits(['bookmark', 'toggle', 'copy', 'share'])
</script>

<template>
  <article :id="`ayah-${ayah.ayah}`" class="ayah-card">
    <div class="ayah-meta">
      <span class="ayah-reference">{{ ayah.id }}</span>
      <div class="ayah-meta-actions">
        <AyahActions
          :ayah="ayah"
          :busy="copying"
          @copy="(ayah, tafsir) => emit('copy', ayah, tafsir)"
          @share="emit('share', $event)"
        /><button
          class="icon-button bookmark-button"
          :aria-label="`${bookmarked ? 'Hiq' : 'Ruaj'} ajetin ${ayah.id}`"
          :aria-pressed="bookmarked"
          @click="emit('bookmark', ayah.id)"
        >
          <Bookmark :size="17" />
        </button>
      </div>
    </div>
    <p v-if="showArabic" class="arabic-text" lang="ar" dir="rtl">
      <QuranText :text="ayah.arabic" :words="ayah.glyphs" :query="query" />
      <span class="arabic-verse-number">{{
        ayah.ayah.toLocaleString('ar', { numberingSystem: 'arab' })
      }}</span>
    </p>
    <p v-if="showAlbanian" class="translation">
      <RichText :text="ayah.albanian" :runs="ayah.albanian_runs" :query="query" />
    </p>
    <div class="ayah-actions">
      <button
        class="tafsir-link"
        :aria-expanded="expanded"
        :aria-controls="`tafsir-${ayah.ayah}`"
        :aria-label="`${expanded ? 'Fshih' : 'Shfaq'} tefsirin e ajetit ${ayah.id}`"
        @click="emit('toggle', ayah.ayah)"
      >
        <BookOpen :size="16" />{{ expanded ? 'Fshih tefsirin' : 'Shfaq tefsirin' }}
      </button>
    </div>
    <div
      v-if="expanded"
      :id="`tafsir-${ayah.ayah}`"
      class="inline-tafsir"
      role="region"
      :aria-label="`Tefsiri i ajetit ${ayah.id}`"
    >
      <section
        v-for="block in blocks"
        :key="`${ayah.id}:${block.id}`"
        class="tafsir-block"
        :class="{ 'shared-tafsir': block.shared }"
      >
        <p v-if="block.shared" class="shared-note">
          Shpjegim i përbashkët për ajetet {{ block.ayahs.join(', ') }}
        </p>
        <TafsirText :nodes="block.nodes" />
      </section>
    </div>
  </article>
</template>
