<script setup>
import RichText from './RichText.vue'
defineProps({ nodes: Array })
</script>
<template>
  <template v-for="node in nodes" :key="node.key">
    <slot v-if="node.type === 'paragraph'" :paragraph="node.paragraph" />
    <component
      v-else
      :is="node.kind === 'ordered' ? 'ol' : 'ul'"
      class="word-list"
      :start="node.kind === 'ordered' ? node.items[0].paragraph.list.value : undefined"
    >
      <li
        v-for="item in node.items"
        :key="item.paragraph.key ?? item.paragraph.index"
        :value="node.kind === 'ordered' ? item.paragraph.list.value : undefined"
      >
        <span class="word-list-marker" aria-hidden="true"
          ><RichText :text="item.paragraph.list.marker" :runs="item.paragraph.list.marker_runs"
        /></span>
        <div class="word-list-content">
          <slot :paragraph="item.paragraph" /><DocumentNodes
            v-if="item.children.length"
            :nodes="item.children"
            ><template #default="{ paragraph }"><slot :paragraph="paragraph" /></template
          ></DocumentNodes>
        </div>
      </li>
    </component>
  </template>
</template>
<style scoped>
.word-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  font-family: var(--reading-font);
  font-size: calc(var(--reading-size) * var(--albanian-scale));
  line-height: 1.8;
}
.word-list > li {
  display: flex;
  align-items: baseline;
  gap: 0.55em;
  margin: 0 0 0.35em;
  padding-left: 0.35em;
}
.word-list-marker {
  min-width: 1.5em;
  flex-shrink: 0;
  text-align: right;
  white-space: pre-wrap;
}
.word-list-content {
  flex: 1;
  min-width: 0;
}
.word-list-content :deep(.document-text) {
  margin-bottom: 0.5em;
}
.word-list-content > .word-list {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
