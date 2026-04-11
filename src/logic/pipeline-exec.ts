import type { CardInstance } from '../stores/card'
import type { Metrics } from '../data/types'
import { usePipelineStore } from '../stores/pipeline'
import { useResultStore } from '../stores/result'
import { useIngredientStore } from '../stores/ingredient'
import { getIngredientById } from '../data/ingredients'

const CRIT_CHANCE = 0.15

export interface ExecutionStep {
  cardUid: string
  techniqueId: string
  techniqueName: string
  emoji: string
  isCrit: boolean
  critName?: string
  critTag?: string
  delta: Metrics
  cumulativeAfter: Metrics
  comboBonus?: string
}

/**
 * Execute the pipeline: process placed cards left-to-right.
 * Returns step-by-step results for animation.
 */
export function executePipeline(placedCards: CardInstance[]): ExecutionStep[] {
  const pipeline = usePipelineStore()
  const result = useResultStore()
  const ingredientStore = useIngredientStore()

  // Collect ingredient tags into dish
  for (const id of ingredientStore.uniqueIngredientIds) {
    const ing = getIngredientById(id)
    if (ing?.tags) {
      for (const tag of ing.tags) {
        pipeline.addTag(tag)
      }
    }
  }

  // Add base ingredient modifiers to metrics (sum of all ingredients × qty)
  let baseMetrics: Metrics = { calories: 0, color: 0, aroma: 0, taste: 0 }
  // Only add ingredient base modifiers on first execution (round 1)
  // Actually, ingredients contribute once at the start, techniques modify each round
  // For simplicity: ingredient base is added in round 1 only
  if (pipeline.executionHistory.length === 0) {
    for (const entry of ingredientStore.basketEntries) {
      baseMetrics.calories += entry.ingredient.baseModifiers.calories * entry.qty
      baseMetrics.color += entry.ingredient.baseModifiers.color * entry.qty
      baseMetrics.aroma += entry.ingredient.baseModifiers.aroma * entry.qty
      baseMetrics.taste += entry.ingredient.baseModifiers.taste * entry.qty
    }
    result.metrics.calories += baseMetrics.calories
    result.metrics.color += baseMetrics.color
    result.metrics.aroma += baseMetrics.aroma
    result.metrics.taste += baseMetrics.taste
  }

  const steps: ExecutionStep[] = []
  const techniqueIds: string[] = []
  let critCount = 0

  for (let i = 0; i < placedCards.length; i++) {
    const card = placedCards[i]
    const tech = card.technique
    const isCrit = Math.random() < CRIT_CHANCE

    // Determine base effects
    let effects = isCrit ? { ...tech.critEffects } : { ...tech.baseEffects }

    // ═══ Combo detection ═══
    let comboBonus: string | undefined

    // Combo: Chop before Heat → +10 color
    if (i > 0) {
      const prev = placedCards[i - 1].technique
      if (prev.id === 'chop' && tech.school === 'heat') {
        effects.color += 10
        comboBonus = '切+加热 → 色+10'
      }
    }

    // Combo: Batter before Deep-fry → 1.2x
    if (i > 0) {
      const prev = placedCards[i - 1].technique
      if (prev.id === 'batter' && tech.id === 'deep_fry') {
        effects.calories = Math.floor(effects.calories * 1.2)
        effects.color = Math.floor(effects.color * 1.2)
        effects.aroma = Math.floor(effects.aroma * 1.2)
        effects.taste = Math.floor(effects.taste * 1.2)
        comboBonus = (comboBonus ? comboBonus + ' | ' : '') + '裹粉+炸 → 效果×1.2'
      }
    }

    // Apply effects
    result.metrics.calories += effects.calories
    result.metrics.color += effects.color
    result.metrics.aroma += effects.aroma
    result.metrics.taste += effects.taste

    // Handle crit
    if (isCrit) {
      critCount++
      pipeline.recordCrit(tech.id)
      if (tech.critTag) {
        pipeline.addTag(tech.critTag)
      }
    }

    techniqueIds.push(tech.id)

    steps.push({
      cardUid: card.uid,
      techniqueId: tech.id,
      techniqueName: tech.name,
      emoji: tech.emoji,
      isCrit,
      critName: isCrit ? tech.critName : undefined,
      critTag: isCrit ? tech.critTag : undefined,
      delta: { ...effects },
      cumulativeAfter: { ...result.metrics },
      comboBonus,
    })
  }

  // Record to pipeline history
  pipeline.recordExecution(techniqueIds)
  result.critCount += critCount

  // Consume cards (clear slots)
  pipeline.clearSlots()

  return steps
}
