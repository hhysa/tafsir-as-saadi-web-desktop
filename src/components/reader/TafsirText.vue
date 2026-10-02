<script setup>
import DocumentNodes from '../text/DocumentNodes.vue'
import RichText from '../text/RichText.vue'
defineProps({ nodes: Array })
</script>

<template>
  <DocumentNodes :nodes="nodes">
    <template #default="{ paragraph }">
      <p class="document-text" :data-source-index="paragraph.index">
        <RichText :text="paragraph.text" :runs="paragraph.runs" />
      </p>
    </template>
  </DocumentNodes>
</template>
