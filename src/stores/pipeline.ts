import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardInstance } from './card'
import { useCardStore } from './card'

export const usePipelineStore = defineStore('pipeline', () => {
  const slots = ref<(CardInstance | null)[]>([])
  const executionHistory = ref<string[]>([])  // technique IDs across all rounds
  const critEvents = ref<Set<string>>(new Set())
  const dishTags = ref<string[]>([])
  const selectedHandCard = ref<string | null>(null) // uid of selected card in hand

  function initSlots(count: number) {
    slots.value = Array(count).fill(null)
    selectedHandCard.value = null
  }

  /** Select a hand card (first tap) */
  function selectHandCard(uid: string) {
    selectedHandCard.value = selectedHandCard.value === uid ? null : uid
  }

  /** Place selected card into a slot (second tap) */
  function placeCardInSlot(slotIndex: number): boolean {
    if (!selectedHandCard.value) return false
    if (slots.value[slotIndex] !== null) return false

    const cardStore = useCardStore()
    const card = cardStore.removeFromHand(selectedHandCard.value)
    if (!card) return false

    slots.value[slotIndex] = card
    selectedHandCard.value = null
    return true
  }

  /** Remove card from slot back to hand */
  function removeFromSlot(slotIndex: number): boolean {
    const card = slots.value[slotIndex]
    if (!card) return false

    const cardStore = useCardStore()
    cardStore.returnToHand(card)
    slots.value[slotIndex] = null
    return true
  }

  /** Swap two slots */
  function swapSlots(a: number, b: number) {
    const temp = slots.value[a]
    slots.value[a] = slots.value[b]
    slots.value[b] = temp
  }

  /** Get placed cards in order (non-null) */
  function getPlacedCards(): CardInstance[] {
    return slots.value.filter((s): s is CardInstance => s !== null)
  }

  /** Record execution for history tracking */
  function recordExecution(techniqueIds: string[]) {
    executionHistory.value.push(...techniqueIds)
  }

  function recordCrit(techniqueId: string) {
    critEvents.value.add(techniqueId)
  }

  function addTag(tag: string) {
    if (!dishTags.value.includes(tag)) {
      dishTags.value.push(tag)
    }
  }

  /** Clear slots after execution (cards consumed) */
  function clearSlots() {
    slots.value = slots.value.map(() => null)
  }

  function $reset() {
    slots.value = []
    executionHistory.value = []
    critEvents.value = new Set()
    dishTags.value = []
    selectedHandCard.value = null
  }

  return {
    slots, executionHistory, critEvents, dishTags, selectedHandCard,
    initSlots, selectHandCard, placeCardInSlot, removeFromSlot, swapSlots,
    getPlacedCards, recordExecution, recordCrit, addTag, clearSlots,
    $reset,
  }
})