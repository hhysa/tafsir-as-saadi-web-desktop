<script setup>
import { ref } from 'vue'
import { X, Sun, Moon, Check, Minus, Plus, BookOpen } from 'lucide-vue-next'
const preferences = defineModel({ required: true })
const settingsDialog = ref(null)
defineExpose({
  open: () => settingsDialog.value.showModal(),
  isOpen: () => Boolean(settingsDialog.value?.open),
})
</script>

<template>
  <dialog
    ref="settingsDialog"
    class="settings-dialog"
    aria-labelledby="settings-title"
    @click="
      (event) => {
        if (event.target === settingsDialog) settingsDialog.close()
      }
    "
  >
    <div class="dialog-header">
      <h2 id="settings-title">Hapësira juaj e leximit</h2>
      <button class="icon-button" aria-label="Mbyll preferencat" @click="settingsDialog.close()">
        <X :size="20" />
      </button>
    </div>
    <p class="settings-intro">Përshtateni leximin sipas dëshirës suaj.</p>
    <span class="section-label">PAMJA</span>
    <div class="theme-options">
      <button
        :class="{ chosen: preferences.theme === 'light' }"
        @click="preferences.theme = 'light'"
      >
        <Sun :size="20" />E çelët<Check v-if="preferences.theme === 'light'" :size="16" /></button
      ><button
        :class="{ chosen: preferences.theme === 'dark' }"
        @click="preferences.theme = 'dark'"
      >
        <Moon :size="20" />E errët<Check v-if="preferences.theme === 'dark'" :size="16" />
      </button>
    </div>
    <div class="setting-row">
      <span>Teksti arabisht</span>
      <div class="font-controls">
        <button
          class="icon-button"
          aria-label="Zvogëlo tekstin arabisht"
          :disabled="preferences.scale <= 0.85"
          @click="
            preferences.scale = Math.max(0.85, Math.round((preferences.scale - 0.05) * 100) / 100)
          "
        >
          <Minus :size="16" /></button
        ><span>{{ Math.round(preferences.scale * 100) }}%</span
        ><button
          class="icon-button"
          aria-label="Zmadho tekstin arabisht"
          :disabled="preferences.scale >= 1.4"
          @click="
            preferences.scale = Math.min(1.4, Math.round((preferences.scale + 0.05) * 100) / 100)
          "
        >
          <Plus :size="16" />
        </button>
      </div>
    </div>
    <div class="setting-row">
      <span>Teksti shqip (përkthim dhe tefsir)</span>
      <div class="font-controls">
        <button
          class="icon-button"
          aria-label="Zvogëlo tekstin shqip"
          :disabled="preferences.albanianScale <= 0.85"
          @click="
            preferences.albanianScale = Math.max(
              0.85,
              Math.round((preferences.albanianScale - 0.05) * 100) / 100,
            )
          "
        >
          <Minus :size="16" /></button
        ><span>{{ Math.round(preferences.albanianScale * 100) }}%</span
        ><button
          class="icon-button"
          aria-label="Zmadho tekstin shqip"
          :disabled="preferences.albanianScale >= 1.4"
          @click="
            preferences.albanianScale = Math.min(
              1.4,
              Math.round((preferences.albanianScale + 0.05) * 100) / 100,
            )
          "
        >
          <Plus :size="16" />
        </button>
      </div>
    </div>
    <label class="setting-row"
      ><span>Teksti në arabisht</span
      ><input
        type="checkbox"
        v-model="preferences.showArabic"
        :disabled="!preferences.showAlbanian"
    /></label>
    <label class="setting-row"
      ><span>Përkthimi në shqip</span
      ><input
        type="checkbox"
        v-model="preferences.showAlbanian"
        :disabled="!preferences.showArabic"
    /></label>
    <label class="setting-row"
      ><span>Hap të gjithë tefsirin si parazgjedhje</span
      ><input type="checkbox" v-model="preferences.openAllTafsir"
    /></label>
    <div class="about-box">
      <BookOpen :size="22" />
      <div>
        <strong>Tefsir Es-Saadi <span>1.0.0</span></strong>
        <p>114 sure · 6 236 ajete · Gjithmonë pranë jush</p>
        <p>
          Ky botim digjital përdor tekstin e nxjerrë nga librat në shqip. Lidhjet automatike të
          tekstit me ajetet janë ende në proces rishikimi.
        </p>
      </div>
    </div>
  </dialog>
</template>
