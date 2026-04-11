import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TECHNIQUES } from '../data/techniques'
import type { TechniqueCard } from '../data/types'
import { useEconomyStore } from './economy'

export interface CardInstance {
  uid: string
  technique: TechniqueCard
}

let nextUid = 1
function createCardInstance(technique: TechniqueCard): CardInstance {
  return { uid: `card_${nextUid++}`, technique }
}

export const useCardStore = defineStore('card', () => {
  const shopDisplay = ref<TechniqueCard[]>([])
  const hand = ref<CardInstance[]>([])
  const refreshCount = ref(0)

  /** Generate 3 distinct random technique cards for the shop */
  function generateShop() {
    const shuffled = [...TECHNIQUES].sort(() => Math.random() - 0.5)
    shopDisplay.value = shuffled.slice(0, 3)
  }

  /** Purchase a card from shop by index */
  function buyCard(shopIndex: number): boolean {
    const card = shopDisplay.value[shopIndex]
    if (!card) return false

    const economy = useEconomyStore()
    if (!economy.spendKitchen(card.price)) return false

    hand.value.push(createCardInstance(card))
    shopDisplay.value.splice(shopIndex, 1)
    return true
  }

  /** Get the cost of the next refresh */
  function getRefreshCost(): number {
    if (refreshCount.value === 0) return 0  // First refresh free
    if (refreshCount.value === 1) return 2  // Second costs 2
    return 3                                 // Third+ costs 3
  }

  /** Refresh the shop with new cards */
  function refreshShop(): boolean {
    const cost = getRefreshCost()
    const economy = useEconomyStore()

    if (cost > 0 && !economy.spendKitchen(cost)) return false

    refreshCount.value++
    generateShop()
    return true
  }

  /** Remove a card from hand (after placing on workbench) */
  function removeFromHand(uid: string): CardInstance | undefined {
    const idx = hand.value.findIndex(c => c.uid === uid)
    if (idx === -1) return undefined
    return hand.value.splice(idx, 1)[0]
  }

  /** Return a card to hand (from workbench) */
  function returnToHand(card: CardInstance) {
    hand.value.push(card)
  }

  /** Reset refresh counter for new round (hand persists) */
  function resetRound() {
    refreshCount.value = 0
  }

  function $reset() {
    shopDisplay.value = []
    hand.value = []
    refreshCount.value = 0
    nextUid = 1
  }

  return {
    shopDisplay, hand, refreshCount,
    generateShop, buyCard, getRefreshCost, refreshShop,
    removeFromHand, returnToHand, resetRound,
    $reset,
  }
})