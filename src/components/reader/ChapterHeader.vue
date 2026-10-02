<script setup>
import { BookOpen } from 'lucide-vue-next'
import QuranText from '../text/QuranText.vue'
defineProps({ chapter: Object, selected: Number })
const emit = defineEmits(['select'])
</script>

<template>
  <section class="chapter-header">
    <div class="chapter-eyebrow">
      <span class="tiny-diamond"></span>SURJA {{ String(chapter.number).padStart(2, '0')
      }}<span class="eyebrow-line"></span>{{ chapter.revelation.toUpperCase() }}
    </div>
    <h1>{{ chapter.name }}</h1>
    <p class="chapter-description">
      {{ chapter.count }} ajete <span>·</span> Përkthimi dhe shpjegimi në gjuhën shqipe
    </p>
    <div class="chapter-divider"><span></span><span class="ornament">❖</span><span></span></div>
    <p v-if="chapter.number !== 9" class="basmala" lang="ar" dir="rtl">
      <QuranText text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" :words="chapter.basmala" />
    </p>
    <p v-else class="opening-label">Surja Et-teube</p>
    <div class="reader-toolbar">
      <span><BookOpen :size="14" /> Leximi i sures</span
      ><label
        >Shko tek ajeti
        <select
          :value="selected"
          aria-label="Shko tek ajeti"
          @change="emit('select', Number($event.target.value))"
        >
          <option v-for="a in chapter.ayahs" :key="a.id" :value="a.ayah">
            {{ a.ayah }}
          </option>
        </select></label
      >
    </div>
  </section>
</template>
