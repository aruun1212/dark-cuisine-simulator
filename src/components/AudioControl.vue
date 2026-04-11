<script setup lang="ts">
import { ref } from 'vue'
import { audioManager, audioState } from '../utils/audio'

const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
}

function toggleMusic() {
  audioManager.toggleMusic()
}

function toggleSFX() {
  audioManager.toggleSFX()
}
</script>

<template>
  <div class="fixed top-3 right-3 z-50">
    <!-- Collapsed button -->
    <button
      v-if="!expanded"
      @click="toggle"
      class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md
             flex items-center justify-center text-lg
             active:scale-90 transition-transform"
    >
      {{ audioState.musicEnabled || audioState.sfxEnabled ? '🎵' : '🔇' }}
    </button>

    <!-- Expanded panel -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 min-w-[140px]"
    >
      <!-- Close -->
      <div class="flex justify-end mb-2">
        <button @click="toggle" class="text-gray-400 text-sm active:scale-90">✕</button>
      </div>

      <!-- Music toggle -->
      <button
        @click="toggleMusic"
        class="w-full flex items-center justify-between px-2 py-2 rounded-lg
               active:bg-gray-50 transition-colors"
      >
        <span class="text-sm">🎵 音乐</span>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full"
          :class="audioState.musicEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
        >
          {{ audioState.musicEnabled ? 'ON' : 'OFF' }}
        </span>
      </button>

      <!-- SFX toggle -->
      <button
        @click="toggleSFX"
        class="w-full flex items-center justify-between px-2 py-2 rounded-lg
               active:bg-gray-50 transition-colors"
      >
        <span class="text-sm">🔊 音效</span>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full"
          :class="audioState.sfxEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
        >
          {{ audioState.sfxEnabled ? 'ON' : 'OFF' }}
        </span>
      </button>
    </div>
  </div>
</template>
