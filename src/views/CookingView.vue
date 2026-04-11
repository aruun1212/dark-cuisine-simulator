<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useEconomyStore } from '../stores/economy'
import { useCardStore } from '../stores/card'
import { usePipelineStore } from '../stores/pipeline'
import { useResultStore } from '../stores/result'
import { executePipeline } from '../logic/pipeline-exec'
import { getChefComment } from '../logic/chef-comment'
import { getTechniqueById } from '../data/techniques'
import { audioManager } from '../utils/audio'

const router = useRouter()
const game = useGameStore()
const economy = useEconomyStore()
const card = useCardStore()
const pipeline = usePipelineStore()
const result = useResultStore()

// ═══════ Execution animation state ═══════
const isExecuting = ref(false)
const execCrits = ref<{ name: string; emoji: string }[]>([])
const showCritIndex = ref(-1)
const extraCritCount = ref(0)  // crits beyond the max display limit
const debugLog = ref<string[]>([])
function dlog(msg: string) { debugLog.value.push(`${Date.now() % 100000}: ${msg}`) }

const hasPlacedCards = computed(() => pipeline.slots.some(s => s !== null))

// ═══════ Context panel: process history ═══════
const processHistory = computed(() => {
  return pipeline.executionHistory.map(id => {
    const tech = getTechniqueById(id)
    return tech ? tech.name : id
  })
})

// ═══════ Context panel: chef comment ═══════
const chefComment = computed(() => {
  // Re-evaluate whenever metrics change
  const m = result.metrics
  if (m.calories === 0 && m.color === 0 && m.aroma === 0 && m.taste === 0) {
    return '等待你的创作...'
  }
  return getChefComment(m)
})

// ═══════ Shop actions ═══════
function buyCard(index: number) {
  card.buyCard(index)
  audioManager.playSFX('buy')
}

function refreshShop() {
  audioManager.playSFX('click')
  card.refreshShop()
}

function goToWorkbench() {
  audioManager.playSFX('click')
  game.goToWorkbench()
}

// ═══════ Workbench actions ═══════
function onHandCardTap(uid: string) {
  audioManager.playSFX('click')
  pipeline.selectHandCard(uid)
}

function onSlotTap(index: number) {
  const slot = pipeline.slots[index]
  if (slot) {
    pipeline.removeFromSlot(index)
    audioManager.playSFX('click')
  } else if (pipeline.selectedHandCard) {
    pipeline.placeCardInSlot(index)
    audioManager.playSFX('place')
  }
}

function backToShop() {
  game.cookingSubPhase = 'shop'
}

// ═══════ Execute (simplified animation) ═══════
const MAX_CRIT_DISPLAY = 2

function startCooking() {
  const placed = pipeline.getPlacedCards()
  dlog(`start: placed=${placed.length} R=${game.currentRound} last=${game.isLastRound}`)
  if (placed.length === 0) return

  game.startExecute()
  isExecuting.value = true
  execCrits.value = []
  showCritIndex.value = -1
  extraCritCount.value = 0

  // Execute pipeline silently in background, collect crits
  let crits: { name: string; emoji: string }[] = []
  try {
    const steps = executePipeline(placed)
    dlog(`exec OK: ${steps.length} steps`)
    crits = steps.filter(s => s.isCrit).map(s => ({
      name: s.critName ?? '暴击！',
      emoji: s.emoji,
    }))
  } catch (e: any) {
    dlog(`exec CRASH: ${e?.message ?? e}`)
  }
  execCrits.value = crits
  dlog(`crits=${crits.length}, timer 2s`)

  if (crits.length > MAX_CRIT_DISPLAY) {
    extraCritCount.value = crits.length - MAX_CRIT_DISPLAY
  }

  audioManager.playSFX('cook')

  // Base cooking animation: 2 seconds, then show crits
  setTimeout(() => {
    dlog(`timer fired crits=${crits.length}`)
    if (crits.length > 0) {
      showNextCrit()
    } else {
      finishExecution()
    }
  }, 2000)
}

function showNextCrit() {
  audioManager.playSFX('crit')
  showCritIndex.value++
  if (showCritIndex.value >= Math.min(execCrits.value.length, MAX_CRIT_DISPLAY)) {
    // All crits shown (or max reached), auto-advance after brief pause
    setTimeout(finishExecution, 400)
  } else {
    // Show each crit for 0.8s
    setTimeout(showNextCrit, 800)
  }
}

function finishExecution() {
  dlog(`finish: last=${game.isLastRound} R=${game.currentRound} phase=${game.phase} sub=${game.cookingSubPhase}`)
  isExecuting.value = false

  if (game.isLastRound) {
    try {
      result.computeFinalResult()
      dlog('computeResult OK')
    } catch (e: any) {
      dlog(`computeResult CRASH: ${e?.message ?? e}`)
    }
    dlog('goToResult + push /result')
    game.goToResult()
    router.push('/result')
  } else {
    game.nextRound()
    dlog(`nextRound -> R=${game.currentRound}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
    <!-- Header bar -->
    <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
                    R{{ game.currentRound }}/3
          </span>
          <span class="text-xs text-gray-400">
            {{ game.cookingSubPhase === 'shop' ? '🏪 商店' : game.cookingSubPhase === 'workbench' ? '🔧 操作台' : '⚡ 烹饪中' }}
          </span>
        </div>
        <div class="text-sm font-bold">🔥 {{ economy.kitchenFunds }}</div>
      </div>

      <!-- Context panel: Process history + Chef comment (visible in all sub-phases) -->
      <div class="mt-2 space-y-1">
        <!-- Process history sequence -->
        <div class="text-xs text-gray-500 truncate">
          📋
          <template v-if="processHistory.length > 0">
            <span v-for="(name, i) in processHistory" :key="i">
              {{ name }}{{ i < processHistory.length - 1 ? ' → ' : '' }}
            </span>
            <span class="text-gray-300"> → ???</span>
          </template>
          <template v-else>
            <span class="text-gray-300">??? → ??? → ???</span>
          </template>
        </div>
        <!-- Chef comment -->
        <div class="text-xs text-amber-700 italic truncate">
          🧑‍🍳 {{ chefComment }}
        </div>
      </div>
    </div>

    <!-- ═══════ SHOP SUB-PHASE ═══════ -->
    <div v-if="game.cookingSubPhase === 'shop'" class="px-4 pt-4 pb-24">
      <h3 class="text-base font-bold mb-3">🏪 手法卡商店</h3>

      <!-- Shop cards -->
      <div class="space-y-2 mb-4">
        <div
          v-for="(tech, idx) in card.shopDisplay"
          :key="tech.id + idx"
          class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ tech.emoji }}</span>
            <div>
              <div class="font-bold">{{ tech.name }}</div>
              <div class="text-xs text-gray-400">{{ tech.school === 'heat' ? '加热' : tech.school === 'process' ? '处理' : tech.school === 'season' ? '调味' : '组合' }}</div>
            </div>
          </div>
          <button
            @click="buyCard(idx)"
            :disabled="!economy.canAffordKitchen(tech.price)"
            class="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold
                   active:scale-95 transition-transform min-h-11
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ tech.price }}🔥 购买
          </button>
        </div>
        <div v-if="card.shopDisplay.length === 0" class="text-center text-gray-400 py-4">
          商店已空，请刷新或前往操作台
        </div>
      </div>

      <!-- Refresh button -->
      <button
        @click="refreshShop"
        :disabled="card.getRefreshCost() > 0 && !economy.canAffordKitchen(card.getRefreshCost())"
        class="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm mb-4
               active:scale-95 transition-transform
               disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🔄 刷新商店 ({{ card.getRefreshCost() === 0 ? '免费' : card.getRefreshCost() + '🔥' }})
      </button>

      <!-- Hand cards -->
      <div v-if="card.hand.length > 0" class="mb-4">
        <h4 class="text-sm font-bold text-gray-500 mb-2">🃏 手牌 ({{ card.hand.length }}张)</h4>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="c in card.hand"
            :key="c.uid"
            class="bg-white rounded-lg px-3 py-2 shadow-sm text-sm flex items-center gap-1"
          >
            <span>{{ c.technique.emoji }}</span>
            <span class="font-medium">{{ c.technique.name }}</span>
          </div>
        </div>
      </div>

      <!-- Go to workbench -->
      <button
        @click="goToWorkbench"
        class="w-full bg-accent text-white py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow"
      >
        🔧 前往操作台
      </button>
    </div>

    <!-- ═══════ WORKBENCH SUB-PHASE ═══════ -->
    <div v-else-if="game.cookingSubPhase === 'workbench'" class="px-4 pt-4 pb-24">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold">🔧 操作台 ({{ game.slotCount }}个槽位)</h3>
        <button @click="backToShop" class="text-sm text-accent font-bold">← 回商店</button>
      </div>

      <!-- Tip -->
      <p class="text-xs text-gray-400 mb-3">
        {{ pipeline.selectedHandCard ? '👆 点击空槽位放入卡片' : '👇 先点击一张手牌选中，再点击槽位放入' }}
      </p>

      <!-- Workbench slots -->
      <div class="flex gap-2 mb-6 justify-center">
        <div
          v-for="(slot, idx) in pipeline.slots"
          :key="idx"
          @click="onSlotTap(idx)"
          class="w-20 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center
                 transition-all cursor-pointer"
          :class="slot
            ? 'bg-white border-primary shadow-md'
            : pipeline.selectedHandCard
              ? 'border-accent bg-accent/5 animate-pulse'
              : 'border-gray-300 bg-gray-50'"
        >
          <template v-if="slot">
            <span class="text-2xl">{{ slot.technique.emoji }}</span>
            <span class="text-xs font-medium mt-1">{{ slot.technique.name }}</span>
            <span class="text-[10px] text-gray-400">点击移除</span>
          </template>
          <template v-else>
            <span class="text-2xl text-gray-300">+</span>
            <span class="text-[10px] text-gray-400">槽位{{ idx + 1 }}</span>
          </template>
        </div>
      </div>

      <!-- Pipeline direction indicator -->
      <div v-if="hasPlacedCards" class="text-center text-xs text-gray-400 mb-4">
        ← 从左到右依次执行 →
      </div>

      <!-- Hand cards (selectable) -->
      <div v-if="card.hand.length > 0" class="mb-6">
        <h4 class="text-sm font-bold text-gray-500 mb-2">🃏 手牌</h4>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="c in card.hand"
            :key="c.uid"
            @click="onHandCardTap(c.uid)"
            class="rounded-xl px-4 py-3 shadow-sm text-sm flex items-center gap-2 cursor-pointer
                   transition-all active:scale-95"
            :class="pipeline.selectedHandCard === c.uid
              ? 'bg-accent text-white ring-2 ring-accent ring-offset-2'
              : 'bg-white'"
          >
            <span class="text-xl">{{ c.technique.emoji }}</span>
            <span class="font-bold">{{ c.technique.name }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-400 text-sm mb-6">
        手牌为空，回商店购买手法卡吧
      </div>

      <!-- Start cooking button -->
      <button
        @click="startCooking"
        :disabled="!hasPlacedCards"
        class="w-full bg-primary text-white py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow
               disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🍳 开始烹饪!
      </button>
    </div>

    <!-- ═══════ EXECUTE SUB-PHASE (simplified animation) ═══════ -->
    <div v-else-if="game.cookingSubPhase === 'execute'" class="px-4 pt-4 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
      <!-- Cooking animation -->
      <div v-if="isExecuting || debugLog.length > 0" class="text-center">
        <!-- Pot shake animation -->
        <div class="text-7xl mb-4 cooking-shake">🍳</div>
        <div class="text-lg font-bold text-gray-700 mb-2">正在烹调...</div>

        <!-- Crit effects -->
        <div v-if="showCritIndex >= 0" class="mt-4 space-y-2">
          <div
            v-for="(crit, idx) in execCrits.slice(0, Math.min(showCritIndex + 1, MAX_CRIT_DISPLAY))"
            :key="idx"
            class="crit-flash inline-block bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-2 shadow-lg"
          >
            <span class="text-xl">{{ crit.emoji }}</span>
            <span class="font-bold text-yellow-900 ml-1">✨ {{ crit.name }}</span>
          </div>
          <!-- Folded extra crits -->
          <div v-if="extraCritCount > 0 && showCritIndex >= MAX_CRIT_DISPLAY - 1" class="text-sm text-yellow-600 font-bold">
            +{{ extraCritCount }} 更多暴击
          </div>
        </div>
      </div>
      <!-- Debug panel (temporary) -->
      <div v-if="debugLog.length > 0" class="mt-6 bg-black/80 text-green-400 text-xs font-mono p-3 rounded-lg text-left max-h-40 overflow-y-auto w-full">
        <div v-for="(line, i) in debugLog" :key="i">{{ line }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pot shake animation */
@keyframes cooking-shake {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-3deg); }
  20% { transform: rotate(3deg); }
  30% { transform: rotate(-3deg); }
  40% { transform: rotate(3deg); }
  50% { transform: rotate(0deg); }
}

.cooking-shake {
  display: inline-block;
  animation: cooking-shake 0.5s ease-in-out infinite;
}

/* Crit flash animation */
@keyframes crit-flash {
  0% { opacity: 0; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

.crit-flash {
  animation: crit-flash 0.4s ease-out;
}
</style>