<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCollectionStore } from '../stores/collection'
import { ENDING_MATRIX, TAG_ENDINGS, RARE_COMBOS } from '../data/endings'
import { TECHNIQUES } from '../data/techniques'

const router = useRouter()
const collection = useCollectionStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-6 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <button @click="router.push('/')" class="text-sm text-accent font-bold">← 返回</button>
      <h2 class="text-lg font-bold">📖 结局图鉴</h2>
      <div></div>
    </div>

    <!-- Overall progress -->
    <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div class="flex justify-between text-sm mb-1">
        <span class="font-bold">收集进度</span>
        <span class="text-gray-500">{{ collection.totalUnlocked }}/{{ collection.totalItems }} ({{ collection.progressPercent }}%)</span>
      </div>
      <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
          :style="{ width: collection.progressPercent + '%' }"
        />
      </div>
    </div>

    <!-- Main Endings -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-500 mb-2">
        🏆 主结局 ({{ collection.mainEndingCount }}/{{ collection.TOTAL_MAIN_ENDINGS }})
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="ending in ENDING_MATRIX"
          :key="ending.name"
          class="rounded-lg p-2.5 text-sm"
          :class="collection.data.mainEndings[ending.name] ? 'bg-white shadow-sm' : 'bg-gray-100'"
        >
          <span v-if="collection.data.mainEndings[ending.name]">{{ ending.name }}</span>
          <span v-else class="text-gray-300">????????</span>
        </div>
      </div>
    </div>

    <!-- Tag Endings -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-500 mb-2">
        🏷️ 标签结局 ({{ collection.tagEndingCount }}/{{ collection.TOTAL_TAG_ENDINGS }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in TAG_ENDINGS"
          :key="tag.tag"
          class="px-3 py-1.5 rounded-full text-sm"
          :class="collection.data.tagEndings[tag.tag]
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-300'"
        >
          {{ collection.data.tagEndings[tag.tag] ? '🏷️ ' + tag.tag : '????' }}
        </span>
      </div>
    </div>

    <!-- Crit Events -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-500 mb-2">
        ✨ 暴击事件 ({{ collection.critEventCount }}/{{ collection.TOTAL_CRIT_EVENTS }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tech in TECHNIQUES"
          :key="tech.id"
          class="px-3 py-1.5 rounded-full text-sm"
          :class="collection.data.critEvents[tech.id]
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-300'"
        >
          {{ collection.data.critEvents[tech.id] ? tech.emoji + ' ' + tech.critName : '??????' }}
        </span>
      </div>
    </div>

    <!-- Rare Combos -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-500 mb-2">
        💎 稀有组合 ({{ collection.rareComboCount }}/{{ collection.TOTAL_RARE_COMBOS }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="combo in RARE_COMBOS"
          :key="combo.id"
          class="px-3 py-1.5 rounded-full text-sm"
          :class="collection.data.rareCombos[combo.id]
            ? 'bg-amber-100 text-amber-800'
            : 'bg-gray-100 text-gray-300'"
        >
          {{ collection.data.rareCombos[combo.id] ? combo.emoji + ' ' + combo.name : '????????' }}
        </span>
      </div>
    </div>
  </div>
</template>
