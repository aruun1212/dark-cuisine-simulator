import type { IngredientCategory } from '../data/types'
import { SHOPPING_STYLES } from '../data/shopping-styles'
import { getIngredientsByCategory } from '../data/ingredients'

const CAPACITY = 10

/**
 * Generate a random shopping basket using stratified random logic.
 * 1. Pick a random shopping style
 * 2. Distribute 10 slots by category weights ±15% perturbation
 * 3. Select 1-2 specific ingredients per active category
 * 4. Ensure total = exactly 10
 */
export function generateRandomBasket(): { basket: Record<string, number>; styleId: string } {
  // Step 1: Pick random style
  const style = SHOPPING_STYLES[Math.floor(Math.random() * SHOPPING_STYLES.length)]

  // Step 2: Distribute capacity by category weights with ±15% perturbation
  const categories = Object.keys(style.weights) as IngredientCategory[]
  const perturbed: Record<string, number> = {}
  let totalWeight = 0

  for (const cat of categories) {
    const base = style.weights[cat] || 0
    const perturbation = 1 + (Math.random() * 0.3 - 0.15) // ±15%
    perturbed[cat] = base * perturbation
    totalWeight += perturbed[cat]
  }

  // Normalize weights and compute raw slot allocation
  const rawSlots: Record<string, number> = {}
  let allocated = 0
  for (const cat of categories) {
    const fraction = perturbed[cat] / totalWeight
    const slots = Math.max(1, Math.round(fraction * CAPACITY))
    rawSlots[cat] = slots
    allocated += slots
  }

  // Adjust to exactly CAPACITY
  while (allocated > CAPACITY) {
    // Remove from the category with the most slots
    const maxCat = categories.reduce((a, b) => rawSlots[a] > rawSlots[b] ? a : b)
    if (rawSlots[maxCat] > 1) {
      rawSlots[maxCat]--
      allocated--
    } else break
  }
  while (allocated < CAPACITY) {
    // Add to a random category
    const cat = categories[Math.floor(Math.random() * categories.length)]
    rawSlots[cat]++
    allocated++
  }

  // Step 3: For each category, pick 1-2 specific ingredients and assign slots
  const basket: Record<string, number> = {}

  for (const cat of categories) {
    const catSlots = rawSlots[cat]
    if (!catSlots || catSlots <= 0) continue

    const available = getIngredientsByCategory(cat)
    if (available.length === 0) continue

    // Pick 1-2 random ingredients
    const pickCount = Math.min(available.length, catSlots >= 2 ? 2 : 1)
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, pickCount)

    // Distribute slots among picked ingredients
    let remaining = catSlots
    for (let i = 0; i < picked.length; i++) {
      const qty = i === picked.length - 1
        ? remaining  // last one gets the rest
        : Math.max(1, Math.floor(remaining / (picked.length - i)) + (Math.random() < 0.5 ? 0 : -1))
      if (qty > 0) {
        basket[picked[i].id] = (basket[picked[i].id] || 0) + qty
        remaining -= qty
      }
    }
    // If any remaining (shouldn't happen but safety)
    if (remaining > 0 && picked.length > 0) {
      basket[picked[0].id] = (basket[picked[0].id] || 0) + remaining
    }
  }

  return { basket, styleId: style.id }
}