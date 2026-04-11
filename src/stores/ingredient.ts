import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useEconomyStore } from './economy'
import { getIngredientById } from '../data/ingredients'

export const useIngredientStore = defineStore('ingredient', () => {
  // basket: ingredientId -> quantity
  const basket = ref<Record<string, number>>({})
  const isLocked = ref(false)

  const basketEntries = computed(() => {
    return Object.entries(basket.value)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty, ingredient: getIngredientById(id)! }))
  })

  const totalUnits = computed(() =>
    Object.values(basket.value).reduce((sum, qty) => sum + qty, 0)
  )

  const uniqueIngredientIds = computed(() =>
    Object.keys(basket.value).filter(id => basket.value[id] > 0)
  )

  function addIngredient(ingredientId: string): boolean {
    if (isLocked.value) return false
    const ingredient = getIngredientById(ingredientId)
    if (!ingredient) return false

    const economy = useEconomyStore()
    if (!economy.addToBasket(1)) return false

    basket.value[ingredientId] = (basket.value[ingredientId] || 0) + 1
    return true
  }

  function removeIngredient(ingredientId: string): boolean {
    if (isLocked.value) return false
    const current = basket.value[ingredientId] || 0
    if (current <= 0) return false

    const economy = useEconomyStore()
    economy.removeFromBasket(1)

    basket.value[ingredientId] = current - 1
    if (basket.value[ingredientId] === 0) {
      delete basket.value[ingredientId]
    }
    return true
  }

  function setBasket(newBasket: Record<string, number>) {
    if (isLocked.value) return
    // Set new basket
    basket.value = { ...newBasket }
    // Recalculate basket count
    const economy = useEconomyStore()
    let count = 0
    for (const [_, qty] of Object.entries(newBasket)) {
      if (qty > 0) count += qty
    }
    economy.basketCount = count
  }

  function lockBasket() {
    isLocked.value = true
  }

  function $reset() {
    basket.value = {}
    isLocked.value = false
  }

  return {
    basket, isLocked,
    basketEntries, totalUnits, uniqueIngredientIds,
    addIngredient, removeIngredient, setBasket, lockBasket,
    $reset,
  }
})