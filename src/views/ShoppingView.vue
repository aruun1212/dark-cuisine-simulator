<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useEconomyStore } from '../stores/economy'
import { useIngredientStore } from '../stores/ingredient'
import { INGREDIENTS, CATEGORY_INFO } from '../data/ingredients'
import { generateRandomBasket } from '../logic/random-shopping'
import type { IngredientCategory } from '../data/types'
import { audioManager } from '../utils/audio'

const router = useRouter()
const game = useGameStore()
const economy = useEconomyStore()
const ingredient = useIngredientStore()

const categories = Object.keys(CATEGORY_INFO) as IngredientCategory[]

const ingredientsByCategory = computed(() => {
  const map: Record<string, typeof INGREDIENTS> = {}
  for (const cat of categories) {
    map[cat] = INGREDIENTS.filter(i => i.category === cat)
  }
  return map
})

function getQty(id: string): number {
  return ingredient.basket[id] || 0
}

function addOne(id: string) {
  if (ingredient.addIngredient(id)) audioManager.playSFX('buy')
}

function removeOne(id: string) {
  if (ingredient.removeIngredient(id)) audioManager.playSFX('click')
}

function randomBasket() {
  audioManager.playSFX('buy')
  const { basket } = generateRandomBasket()
  ingredient.setBasket(basket)
}

function startCooking() {
  if (ingredient.totalUnits === 0) return
  audioManager.playSFX('click')
  ingredient.lockBasket()
  game.startCooking()
  router.push('/cooking')
}
</script>

<template>
  <div class="min-h-screen pb-32 bg-gradient-to-b from-amber-50 to-orange-50">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm px-4 py-3">
      <div class="flex items-center justify-center gap-4">
        <h2 class="text-lg font-bold">🛒 超市采购</h2>
        <div class="text-sm font-medium text-gray-500">
          🧺 {{ economy.basketCount }}/{{ economy.basketCapacity }}份
        </div>
      </div>
    </div>

    <!-- Random button -->
    <div class="px-4 pt-4 pb-2">
      <button
        @click="randomBasket"
        class="w-full bg-secondary text-dark py-3 rounded-xl font-bold text-base
               active:scale-95 transition-transform shadow flex items-center justify-center gap-2"
      >
        🎲 一键随机
      </button>
    </div>

    <!-- Ingredient grid by category -->
    <div class="px-4 space-y-4 mt-2">
      <div v-for="cat in categories" :key="cat">
        <h3 class="text-sm font-bold text-gray-500 mb-2">
          {{ CATEGORY_INFO[cat].emoji }} {{ CATEGORY_INFO[cat].name }}
        </h3>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="ing in ingredientsByCategory[cat]"
            :key="ing.id"
            class="bg-white rounded-xl p-2.5 shadow-sm flex flex-col items-center gap-1.5"
          >
            <span class="text-2xl">{{ ing.emoji }}</span>
            <div class="text-sm font-medium text-center">{{ ing.name }}</div>
            <div class="flex items-center gap-1">
              <button
                @click="removeOne(ing.id)"
                :disabled="getQty(ing.id) === 0"
                class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-base
                       flex items-center justify-center active:bg-gray-200
                       disabled:opacity-30 disabled:cursor-not-allowed"
              >−</button>
              <span class="w-5 text-center text-sm font-bold">{{ getQty(ing.id) }}</span>
              <button
                @click="addOne(ing.id)"
                class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-base
                       flex items-center justify-center active:bg-primary/20"
              >+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-t border-t px-4 py-3">
      <div class="max-w-md mx-auto flex items-center justify-between gap-3">
        <div class="text-sm">
          <span class="font-bold text-primary">{{ ingredient.totalUnits }}/{{ economy.basketCapacity }}份</span>
        </div>
        <button
          @click="startCooking"
          :disabled="ingredient.totalUnits === 0"
          class="bg-primary text-white py-2.5 px-5 rounded-xl text-sm font-bold
                 active:scale-95 transition-transform shadow
                 disabled:opacity-40 disabled:cursor-not-allowed"
        >🍳 开始烹饪!</button>
      </div>
    </div>
  </div>
</template>
