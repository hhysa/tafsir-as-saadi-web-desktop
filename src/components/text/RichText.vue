<script setup>
import { computed } from 'vue'
import { highlightedRuns } from '../../lib/highlight.js'
const props = defineProps({ runs: Array, text: String, query: String })
const parts = computed(() => highlightedRuns(props.text, props.runs, props.query))
</script>

<template>
  <span class="rich-text"
    ><component
      v-for="(part, index) in parts"
      :key="index"
      :is="part.highlighted ? 'mark' : 'span'"
      :class="{ 'search-highlight': part.highlighted }"
      ><strong v-if="part.bold"
        ><em v-if="part.italic">{{ part.text }}</em
        ><template v-else>{{ part.text }}</template></strong
      ><em v-else-if="part.italic">{{ part.text }}</em
      ><template v-else>{{ part.text }}</template></component
    ></span
  >
</template>

<style scoped>
.rich-text {
  white-space: pre-wrap;
}
strong {
  font-weight: 700;
}
em {
  font-style: italic;
}
</style>
