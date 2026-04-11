<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useResultStore } from '../stores/result'
import { getTechniqueById } from '../data/techniques'
import { RARE_COMBOS } from '../data/endings'
import { captureAndDownload } from '../utils/share'
import { audioManager } from '../utils/audio'
import { GAME_URL } from '../config'
import QRCode from 'qrcode'

const router = useRouter()
const game = useGameStore()
const result = useResultStore()

// Play result sound on mount
audioManager.playSFX('result')

const shareCard = ref<HTMLElement | null>(null)
const qrDataUrl = ref('')

onMounted(async () => {
  if (GAME_URL) {
    try {
      qrDataUrl.value = await QRCode.toDataURL(GAME_URL, { width: 100, margin: 1 })
    } catch {
      // QR generation failed, use placeholder
    }
  }
})

const tierLabels: Record<number, string> = {
  1: '负/黑洞', 2: '几乎没有', 3: '淡雅',
  4: '适中', 5: '浓郁', 6: '极致', 7: '超维度',
}

const triggeredRareCombos = RARE_COMBOS.filter(c => result.rareCombos.includes(c.id))

function getTechName(id: string) {
  return getTechniqueById(id)?.name ?? id
}

function getTechEmoji(id: string) {
  return getTechniqueById(id)?.emoji ?? '🔧'
}

function playAgain() {
  game.startShopping()
  router.push('/shopping')
}

async function share() {
  audioManager.playSFX('share')
  if (shareCard.value) {
    await captureAndDownload(shareCard.value)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-6 pb-24">
    <!-- Share card container -->
    <div ref="shareCard" class="bg-white rounded-2xl p-5 shadow-lg max-w-sm mx-auto">
      <!-- Title -->
      <div class="text-center mb-4">
        <div class="text-sm text-gray-400">🍳 黑暗料理模拟器</div>
      </div>

      <!-- Dish name (xl font-black, most prominent) -->
      <h1 class="text-xl font-black text-center text-dark mb-2 leading-tight">
        📛 {{ result.dishName }}
      </h1>

      <!-- Ending name (badge) + Rare combos (yellow badge) -->
      <div class="text-center mb-3">
        <span class="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-base">
          🏆 {{ result.endingName }}
        </span>
      </div>
      <div v-if="triggeredRareCombos.length > 0" class="text-center mb-3">
        <div v-for="combo in triggeredRareCombos" :key="combo.id"
          class="inline-block bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm mr-1 mb-1">
          {{ combo.emoji }} {{ combo.name }}
        </div>
      </div>

      <!-- Sub-comments / evaluation (large italic text) -->
      <div v-if="result.subComments.length > 0" class="mb-4 text-center">
        <p v-for="(comment, i) in result.subComments" :key="i"
          class="text-base text-gray-700 italic font-medium leading-relaxed">
          💬 "{{ comment }}"
        </p>
      </div>

      <!-- Tags -->
      <div v-if="result.endingTags.length > 0" class="flex flex-wrap justify-center gap-1 mb-4">
        <span v-for="tag in result.endingTags" :key="tag"
          class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
          🏷️ {{ tag }}
        </span>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-100 my-3"></div>

      <!-- Calories: large number + tier comment -->
      <div class="text-center mb-4">
        <div class="text-xs text-gray-400 mb-1">🔥 卡路里</div>
        <div class="font-black text-2xl text-dark">{{ result.metrics.calories }} kcal</div>
        <div class="text-sm text-gray-500 mt-0.5">{{ tierLabels[result.tiers.calories] }}</div>
      </div>

      <!-- Color / Aroma / Taste: tier label only, small gray text, no numbers -->
      <div class="flex justify-center gap-6 mb-4 text-sm text-gray-400">
        <div class="text-center">
          <span>🎨 色</span>
          <div class="mt-0.5">{{ tierLabels[result.tiers.color] }}</div>
        </div>
        <div class="text-center">
          <span>👃 香</span>
          <div class="mt-0.5">{{ tierLabels[result.tiers.aroma] }}</div>
        </div>
        <div class="text-center">
          <span>👅 味</span>
          <div class="mt-0.5">{{ tierLabels[result.tiers.taste] }}</div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-100 my-3"></div>

      <!-- Process sequence + crit count (auxiliary info at bottom) -->
      <div class="text-center text-xs text-gray-400 mb-2">
        <span>📋 </span>
        <span v-for="(id, i) in result.techniqueSequence" :key="i">
          {{ getTechEmoji(id) }}{{ getTechName(id) }}{{ i < result.techniqueSequence.length - 1 ? ' → ' : '' }}
        </span>
      </div>
      <div v-if="result.critCount > 0" class="text-center text-xs text-yellow-600">
        ✨ 暴击 × {{ result.critCount }}
      </div>

      <!-- QR Code area -->
      <div class="border-t border-gray-100 my-3"></div>
      <div class="text-center">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-20 h-20 mx-auto mb-1" />
        <div v-else class="text-sm text-gray-300 py-3">🎮 扫码来玩</div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="max-w-sm mx-auto mt-6 space-y-3">
      <button
        @click="share"
        class="w-full bg-accent text-white py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow flex items-center justify-center gap-2"
      >
        📱 保存分享图片
      </button>
      <button
        @click="playAgain"
        class="w-full bg-primary text-white py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow"
      >
        🔄 再来一局
      </button>
      <button
        @click="router.push('/collection')"
        class="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform"
      >
        📖 结局图鉴
      </button>
    </div>
  </div>
</template>