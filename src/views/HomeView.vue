<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useCollectionStore } from '../stores/collection'
import { audioManager } from '../utils/audio'

const router = useRouter()
const game = useGameStore()
const collection = useCollectionStore()

function startGame() {
  audioManager.playSFX('click')
  audioManager.playBGM()
  game.startShopping()
  router.push('/shopping')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-amber-50 to-orange-50">
    <!-- Logo area -->
    <div class="text-center mb-8 animate-bounce-slow">
      <div class="text-7xl mb-2">🍳</div>
      <h1 class="text-3xl font-black text-dark tracking-tight">黑暗料理模拟器</h1>
      <p class="text-sm text-gray-400 mt-2">做出你的黑暗料理吧！</p>
    </div>

    <!-- Buttons -->
    <div class="flex flex-col gap-4 w-full max-w-xs">
      <button
        @click="startGame"
        class="bg-primary text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-lg
               active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        🛒 开始游戏
      </button>

      <button
        @click="router.push('/collection')"
        class="bg-accent text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-lg
               active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        📖 结局图鉴
        <span class="text-sm opacity-80">({{ collection.totalUnlocked }}/{{ collection.totalItems }})</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="mt-12 text-center text-xs text-gray-300">
      <p>Made with ❤️ by <a href="https://github.com/aruun1212" target="_blank" rel="noopener" class="underline hover:text-gray-500">@aruun1212</a></p>
    </div>
  </div>
</template>
