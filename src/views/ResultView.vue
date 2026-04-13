<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useResultStore } from '../stores/result'
import { getTechniqueById } from '../data/techniques'
import { RARE_COMBOS } from '../data/endings'
import { audioManager } from '../utils/audio'
import { GAME_URL } from '../config'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas-pro'

const router = useRouter()
const game = useGameStore()
const result = useResultStore()

// Play result sound on mount
audioManager.playSFX('result')

// Share overlay state
const showShareOverlay = ref(false)
const shareImageUrl = ref('')
const shareCard = ref<HTMLElement | null>(null)
const qrDataUrl = ref('')
const isGenerating = ref(false)

onMounted(async () => {
  // Pre-generate QR code (for the share image only, not shown on result page)
  if (GAME_URL) {
    try {
      qrDataUrl.value = await QRCode.toDataURL(GAME_URL, { width: 100, margin: 1 })
    } catch {
      // QR generation failed silently
    }
  }
})

const tierLabels: Record<number, string> = {
  1: '翻车现场💀', 2: '若有似无', 3: '小有心意',
  4: '中规中矩', 5: '有点东西', 6: '绝绝子🔥', 7: '封神之作👑',
}

/** Tier → percentage for progress bar (1~7 → 0%~100%) */
function tierPercent(tier: number): number {
  const map: Record<number, number> = { 1: 5, 2: 18, 3: 35, 4: 50, 5: 70, 6: 88, 7: 100 }
  return map[tier] ?? 0
}

/** Tier → bar color class */
function tierBarColor(tier: number): string {
  if (tier <= 1) return 'bg-gray-400'
  if (tier <= 2) return 'bg-blue-300'
  if (tier <= 3) return 'bg-green-400'
  if (tier <= 4) return 'bg-yellow-400'
  if (tier <= 5) return 'bg-orange-400'
  if (tier <= 6) return 'bg-red-400'
  return 'bg-gradient-to-r from-purple-500 to-pink-500'
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
  isGenerating.value = true
  showShareOverlay.value = true
  await nextTick()

  // Capture the hidden share card (which includes QR code)
  if (shareCard.value) {
    try {
      const canvas = await html2canvas(shareCard.value, {
        backgroundColor: '#FFF8F0',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      shareImageUrl.value = canvas.toDataURL('image/png')
    } catch {
      shareImageUrl.value = ''
    }
  }
  isGenerating.value = false
}

function closeOverlay() {
  showShareOverlay.value = false
  shareImageUrl.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-6 pb-24">
    <!-- ═══════ Result Display (NO QR code here) ═══════ -->
    <div class="bg-white rounded-2xl p-5 shadow-lg max-w-sm mx-auto">
      <!-- Title -->
      <div class="text-center mb-4">
        <div class="text-sm text-gray-400">🍳 黑暗料理模拟器</div>
      </div>

      <!-- Dish name -->
      <h1 class="text-xl font-black text-center text-dark mb-2 leading-tight">
        📛 {{ result.dishName }}
      </h1>

      <!-- Ending name -->
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

      <!-- Sub-comments -->
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

      <div class="border-t border-gray-100 my-3"></div>

      <!-- Calories -->
      <div class="text-center mb-4">
        <div class="text-xs text-gray-400 mb-1">🔥 卡路里</div>
        <div class="font-black text-2xl text-dark">{{ result.metrics.calories }} kcal</div>
        <div class="text-sm text-gray-500 mt-0.5">{{ tierLabels[result.tiers.calories] }}</div>
      </div>

      <!-- Color / Aroma / Taste with progress bars -->
      <div class="space-y-3 mb-4 px-2">
        <div v-for="dim in [
          { label: '🎨 色', tier: result.tiers.color },
          { label: '👃 香', tier: result.tiers.aroma },
          { label: '👅 味', tier: result.tiers.taste },
        ]" :key="dim.label">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-500 font-medium">{{ dim.label }}</span>
            <span class="text-xs text-gray-400">{{ tierLabels[dim.tier] }}</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="tierBarColor(dim.tier)"
              :style="{ width: tierPercent(dim.tier) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 my-3"></div>

      <!-- Process sequence -->
      <div class="text-center text-xs text-gray-400 mb-2">
        <span>📋 </span>
        <span v-for="(id, i) in result.techniqueSequence" :key="i">
          {{ getTechEmoji(id) }}{{ getTechName(id) }}{{ i < result.techniqueSequence.length - 1 ? ' → ' : '' }}
        </span>
      </div>
      <div v-if="result.critCount > 0" class="text-center text-xs text-yellow-600">
        ✨ 暴击 × {{ result.critCount }}
      </div>
    </div>

    <!-- Action buttons -->
    <div class="max-w-sm mx-auto mt-6 space-y-3">
      <button
        @click="share"
        class="w-full bg-accent text-white py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow flex items-center justify-center gap-2"
      >
        📱 分享结果
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

    <!-- ═══════ Hidden share card (with QR, for screenshot only) ═══════ -->
    <div class="fixed -left-[9999px] top-0">
      <div ref="shareCard" class="bg-white p-5 w-[340px]">
        <div class="text-center mb-3">
          <div class="text-sm text-gray-400">🍳 黑暗料理模拟器</div>
        </div>
        <h2 class="text-xl font-black text-center mb-2">📛 {{ result.dishName }}</h2>
        <div class="text-center mb-3">
          <span class="inline-block bg-orange-100 text-orange-700 font-bold px-4 py-1.5 rounded-full text-base">
            🏆 {{ result.endingName }}
          </span>
        </div>
        <div v-if="result.subComments.length > 0" class="mb-3 text-center">
          <p v-for="(comment, i) in result.subComments" :key="i"
            class="text-sm text-gray-600 italic leading-relaxed">
            💬 "{{ comment }}"
          </p>
        </div>
        <div class="text-center mb-3">
          <div class="text-xs text-gray-400 mb-1">🔥 卡路里</div>
          <div class="font-black text-xl">{{ result.metrics.calories }} kcal</div>
        </div>
        <!-- Color / Aroma / Taste bars for share card -->
        <div class="space-y-2 mb-3 px-1">
          <div v-for="dim in [
            { label: '🎨 色', tier: result.tiers.color },
            { label: '👃 香', tier: result.tiers.aroma },
            { label: '👅 味', tier: result.tiers.taste },
          ]" :key="dim.label">
            <div class="flex items-center justify-between text-xs mb-0.5">
              <span class="text-gray-500">{{ dim.label }}</span>
              <span class="text-gray-400">{{ tierLabels[dim.tier] }}</span>
            </div>
            <div style="width:100%;height:8px;background:#f3f4f6;border-radius:9999px;overflow:hidden">
              <div
                :style="{
                  width: tierPercent(dim.tier) + '%',
                  height: '100%',
                  borderRadius: '9999px',
                  background: dim.tier <= 1 ? '#9ca3af' : dim.tier <= 2 ? '#93c5fd' : dim.tier <= 3 ? '#4ade80' : dim.tier <= 4 ? '#facc15' : dim.tier <= 5 ? '#fb923c' : dim.tier <= 6 ? '#f87171' : 'linear-gradient(to right, #a855f7, #ec4899)',
                }"
              ></div>
            </div>
          </div>
        </div>
        <div class="text-center text-xs text-gray-400 mb-3">
          <span v-for="(id, i) in result.techniqueSequence" :key="i">
            {{ getTechEmoji(id) }}{{ getTechName(id) }}{{ i < result.techniqueSequence.length - 1 ? ' → ' : '' }}
          </span>
        </div>
        <!-- QR Code (only in share image) -->
        <div class="border-t border-gray-200 pt-3 flex items-center justify-center gap-3">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="w-16 h-16" />
          <div class="text-xs text-gray-400 text-left">
            <div class="font-bold text-gray-600">扫码来玩 👆</div>
            <div>黑暗料理模拟器</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ Share Overlay ═══════ -->
    <div v-if="showShareOverlay" class="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-6"
         @click.self="closeOverlay">
      <div v-if="isGenerating" class="text-white text-lg font-bold animate-pulse">
        📸 生成分享图片中...
      </div>
      <template v-else-if="shareImageUrl">
        <img :src="shareImageUrl" class="max-w-[90vw] max-h-[70vh] rounded-xl shadow-2xl" />
        <p class="text-white/80 text-sm mt-4 text-center">📱 长按图片保存到相册</p>
        <button @click="closeOverlay"
          class="mt-4 bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold
                 active:scale-95 transition-transform">
          ✕ 关闭
        </button>
      </template>
      <div v-else class="text-white text-center">
        <p class="text-lg mb-3">😢 图片生成失败</p>
        <button @click="closeOverlay"
          class="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>