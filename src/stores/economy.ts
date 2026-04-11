import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Per-round kitchen fund allocation */
const ROUND_FUNDS = [8, 10, 12] // R1-R3, total 30

export const useEconomyStore = defineStore('economy', () => {
  // ═══════ Shopping (局外) — only basket capacity ═══════
  const basketCount = ref(0)
  const basketCapacity = ref(10)

  const basketRemaining = computed(() => basketCapacity.value - basketCount.value)

  function addToBasket(units: number): boolean {
    if (basketCount.value + units > basketCapacity.value) return false
    basketCount.value += units
    return true
  }

  function removeFromBasket(units: number) {
    basketCount.value = Math.max(0, basketCount.value - units)
  }

  // ═══════ Kitchen funds (局内) ═══════
  const kitchenFunds = ref(0)

  /** Called at the start of each round to allocate funds */
  function allocateRoundFunds(round: number) {
    const idx = Math.min(round - 1, ROUND_FUNDS.length - 1)
    kitchenFunds.value += ROUND_FUNDS[idx]
  }

  function getRoundAllocation(round: number): number {
    const idx = Math.min(round - 1, ROUND_FUNDS.length - 1)
    return ROUND_FUNDS[idx]
  }

  function spendKitchen(amount: number): boolean {
    if (kitchenFunds.value < amount) return false
    kitchenFunds.value -= amount
    return true
  }

  function canAffordKitchen(amount: number): boolean {
    return kitchenFunds.value >= amount
  }

  // ═══════ Reset ═══════
  function $reset() {
    basketCount.value = 0
    basketCapacity.value = 10
    kitchenFunds.value = 0
  }

  return {
    // Shopping
    basketCount, basketCapacity,
    basketRemaining,
    addToBasket, removeFromBasket,
    // Kitchen
    kitchenFunds,
    allocateRoundFunds, getRoundAllocation, spendKitchen, canAffordKitchen,
    // Reset
    $reset,
  }
})