import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useEconomyStore } from './economy'
import { useIngredientStore } from './ingredient'
import { useCardStore } from './card'
import { usePipelineStore } from './pipeline'
import { useResultStore } from './result'

export type GamePhase = 'home' | 'shopping' | 'cooking' | 'result'
export type CookingSubPhase = 'shop' | 'workbench' | 'execute'

/** Workbench slot counts per round */
const SLOT_COUNTS = [1, 2, 3] // R1-R3

export const useGameStore = defineStore('game', () => {
  const phase = ref<GamePhase>('home')
  const currentRound = ref(1)
  const cookingSubPhase = ref<CookingSubPhase>('shop')

  const slotCount = computed(() => {
    const idx = Math.min(currentRound.value - 1, SLOT_COUNTS.length - 1)
    return SLOT_COUNTS[idx]
  })

  const isLastRound = computed(() => currentRound.value >= 3)

  // ═══════ Phase transitions ═══════
  function startShopping() {
    $reset()
    phase.value = 'shopping'
  }

  function startCooking() {
    phase.value = 'cooking'
    currentRound.value = 1
    cookingSubPhase.value = 'shop'
    // Allocate first round funds
    const economy = useEconomyStore()
    economy.allocateRoundFunds(1)
    // Initialize pipeline slots
    const pipeline = usePipelineStore()
    pipeline.initSlots(SLOT_COUNTS[0])
    // Generate initial shop
    const card = useCardStore()
    card.generateShop()
  }

  function goToWorkbench() {
    cookingSubPhase.value = 'workbench'
  }

  function startExecute() {
    cookingSubPhase.value = 'execute'
  }

  function nextRound() {
    if (currentRound.value >= 3) {
      phase.value = 'result'
      return
    }
    currentRound.value++
    cookingSubPhase.value = 'shop'
    // Allocate funds for new round
    const economy = useEconomyStore()
    economy.allocateRoundFunds(currentRound.value)
    // Re-init pipeline slots for new round
    const pipeline = usePipelineStore()
    pipeline.initSlots(SLOT_COUNTS[currentRound.value - 1])
    // Generate new shop & reset refresh counter
    const card = useCardStore()
    card.resetRound()
    card.generateShop()
  }

  function goToResult() {
    phase.value = 'result'
  }

  // ═══════ Full reset (all stores except collection) ═══════
  function $reset() {
    phase.value = 'home'
    currentRound.value = 1
    cookingSubPhase.value = 'shop'
    useEconomyStore().$reset()
    useIngredientStore().$reset()
    useCardStore().$reset()
    usePipelineStore().$reset()
    useResultStore().$reset()
  }

  return {
    phase, currentRound, cookingSubPhase,
    slotCount, isLastRound,
    startShopping, startCooking, goToWorkbench, startExecute, nextRound, goToResult,
    $reset,
  }
})