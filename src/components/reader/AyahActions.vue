<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { Copy, BookOpen, Share2, Ellipsis } from 'lucide-vue-next'
const props = defineProps({ ayah: Object, busy: Boolean })
const emit = defineEmits(['copy', 'share'])
const open = ref(false)
const root = ref(null)
const trigger = ref(null)
const options = ref(null)
function close(restoreFocus = false) {
  open.value = false
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}
async function toggle() {
  if (open.value) return close(true)
  open.value = true
  await nextTick()
  options.value?.querySelector('button')?.focus({ preventScroll: true })
}
function outside(event) {
  if (!root.value?.contains(event.target)) close()
}
watch(open, (value) => {
  if (value) document.addEventListener('pointerdown', outside)
  else document.removeEventListener('pointerdown', outside)
})
onUnmounted(() => document.removeEventListener('pointerdown', outside))
function choose(action) {
  close(true)
  if (action === 'share') emit('share', props.ayah)
  else emit('copy', props.ayah, action === 'tafsir')
}
</script>

<template>
  <div
    ref="root"
    class="ayah-menu"
    @keydown.esc.stop.prevent="close(true)"
    @focusout="
      (event) => {
        if (!root.contains(event.relatedTarget)) close()
      }
    "
  >
    <button
      ref="trigger"
      class="icon-button"
      :disabled="busy"
      :aria-label="`Veprime për ajetin ${ayah.id}`"
      :aria-expanded="open"
      :aria-controls="`ayah-options-${ayah.id}`"
      @click="toggle"
    >
      <Ellipsis :size="20" />
    </button>
    <div
      v-if="open"
      ref="options"
      :id="`ayah-options-${ayah.id}`"
      class="ayah-menu-options"
      role="group"
      :aria-label="`Kopjo ose shpërnda ajetin ${ayah.id}`"
    >
      <button :aria-label="`Kopjo ajetin ${ayah.id}`" @click="choose('ayah')">
        <Copy :size="16" />Kopjo ajetin
      </button>
      <button :aria-label="`Kopjo ajetin ${ayah.id} me tefsir`" @click="choose('tafsir')">
        <BookOpen :size="16" />Kopjo ajetin me tefsir
      </button>
      <button :aria-label="`Shpërnda ajetin ${ayah.id}`" @click="choose('share')">
        <Share2 :size="16" />Shpërnda
      </button>
    </div>
  </div>
</template>

<style scoped>
.ayah-menu {
  position: relative;
}
.ayah-menu-options {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 10;
  width: 240px;
  max-width: calc(100vw - 48px);
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--paper);
  box-shadow: var(--shadow);
  color: var(--ink);
}
.ayah-menu-options button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 10px;
  border-radius: 6px;
  font-size: 14px;
}
.ayah-menu-options button:hover,
.ayah-menu-options button:focus-visible {
  background: var(--soft-accent);
}
</style>
