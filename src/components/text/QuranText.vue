<script>
const fonts = new Map()
function loadPage(page) {
  if (!Number.isInteger(page) || page < 1 || page > 604)
    return Promise.reject(new Error('Invalid Mushaf page'))
  if (!fonts.has(page)) {
    const face = new FontFace(
      `QCF2-${page}`,
      `url("${import.meta.env.BASE_URL}fonts/qcf-v2/QCF2${String(page).padStart(3, '0')}.ttf")`,
    )
    fonts.set(
      page,
      face
        .load()
        .then((font) => {
          document.fonts.add(font)
        })
        .catch((error) => {
          fonts.delete(page)
          throw error
        }),
    )
  }
  return fonts.get(page)
}
</script>
<script setup>
import RichText from './RichText.vue'
import { matchRanges } from '../../lib/highlight.js'
import { ref, watch } from 'vue'
const props = defineProps({ text: String, words: Array, query: String })
const ready = ref(false)
watch(
  () => props.words,
  async (words, previous, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    ready.value = false
    try {
      if (!words?.length) return
      await Promise.all([...new Set(words.map((w) => w.page))].map(loadPage))
      if (active) ready.value = true
    } catch {
      /* Keep readable Unicode text if a local font cannot load. */
    }
  },
  { immediate: true },
)
function copyText(event) {
  if (!event.clipboardData) return
  event.clipboardData.setData('text/plain', props.text)
  event.preventDefault()
}
</script>
<template>
  <span class="quran-text" :aria-label="text" @copy="copyText"
    ><RichText
      v-if="matchRanges(text, query).length"
      :text="text"
      :query="query"
      aria-hidden="true"
    /><span v-else-if="ready" aria-hidden="true" class="qcf-v2"
      ><template v-for="(word, index) in words" :key="index"
        ><span class="qcf-word" :style="{ fontFamily: `QCF2-${word.page}` }">{{ word.code }}</span
        >{{ ' ' }}</template
      ></span
    ><span v-else aria-hidden="true">{{ text }}</span></span
  >
</template>
<style scoped>
.qcf-word {
  display: inline-block;
  font-weight: 400;
  font-style: normal;
}
.qcf-v2 {
  word-spacing: 0;
}
</style>
