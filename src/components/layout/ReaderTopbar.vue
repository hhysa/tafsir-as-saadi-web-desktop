<script setup>
import { Menu, ChevronRight, Search, Settings2 } from 'lucide-vue-next'
defineProps({ chapterName: String, directory: Boolean, sidebarOpen: Boolean })
const emit = defineEmits(['menu', 'search', 'settings'])
</script>

<template>
  <header class="topbar">
    <div class="breadcrumb">
      <button
        class="icon-button menu-button"
        :aria-label="sidebarOpen ? 'Mbyll menynë' : 'Hap menynë'"
        :aria-expanded="sidebarOpen"
        aria-controls="library-sidebar"
        @click="emit('menu')"
      >
        <Menu :size="20" /></button
      ><a class="surahs-link" href="#/surahs" :aria-current="directory ? 'page' : undefined"
        >Suret</a
      ><ChevronRight v-if="!directory" :size="14" /><strong v-if="!directory">{{
        chapterName || 'Kurani'
      }}</strong>
    </div>
    <div class="topbar-actions">
      <span class="edition-label">LEXIM & REFLEKTIM</span
      ><button
        class="icon-button mobile-search"
        aria-label="Kërko në Kuran"
        @click="emit('search')"
      >
        <Search :size="19" /></button
      ><button class="settings-button" @click="emit('settings')">
        <Settings2 :size="17" /><span>Preferencat</span>
      </button>
    </div>
  </header>
</template>
