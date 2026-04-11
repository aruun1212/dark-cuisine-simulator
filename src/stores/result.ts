import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Metrics } from '../data/types'
import { determineEnding, processTagEndings, checkRareCombos } from '../logic/rating'
import { generateDishName } from '../logic/naming'
import { usePipelineStore } from './pipeline'
import { useIngredientStore } from './ingredient'
import { useCollectionStore } from './collection'
import type { TierResult } from '../logic/rating'

export const useResultStore = defineStore('result', () => {
  const metrics = ref<Metrics>({ calories: 0, color: 0, aroma: 0, taste: 0 })
  const tiers = ref<TierResult>({ calories: 0, color: 0, aroma: 0, taste: 0 })
  const dishName = ref('')
  const endingName = ref('')
  const endingTags = ref<string[]>([])
  const subComments = ref<string[]>([])
  const techniqueSequence = ref<string[]>([])
  const critCount = ref(0)
  const rareCombos = ref<string[]>([])

  /** Compute final result after round 5 */
  function computeFinalResult() {
    const pipeline = usePipelineStore()
    const ingredient = useIngredientStore()

    // Determine ending
    const ending = determineEnding(metrics.value)
    tiers.value = ending.tiers

    // Process tags
    const tagResult = processTagEndings(pipeline.dishTags)
    let finalEndingName = ending.endingName
    for (const mod of tagResult.nameModifiers) {
      finalEndingName += mod
    }

    endingName.value = finalEndingName
    endingTags.value = [...pipeline.dishTags]
    subComments.value = tagResult.subComments
    techniqueSequence.value = [...pipeline.executionHistory]

    // Generate dish name
    dishName.value = generateDishName(
      pipeline.executionHistory,
      ingredient.uniqueIngredientIds,
    )

    // Check rare combos
    const comboCtx = {
      ingredientIds: ingredient.uniqueIngredientIds,
      techniqueIds: pipeline.executionHistory,
      critCount: critCount.value,
      metrics: metrics.value,
      tiers: ending.tiers,
    }
    rareCombos.value = checkRareCombos(comboCtx)

    // Unlock collection items
    const collection = useCollectionStore()
    collection.unlockEnding(ending.endingName)
    for (const tag of pipeline.dishTags) {
      collection.unlockTag(tag)
    }
    for (const techId of pipeline.critEvents) {
      collection.unlockCrit(techId)
    }
    for (const comboId of rareCombos.value) {
      collection.unlockRareCombo(comboId)
    }
  }

  function $reset() {
    metrics.value = { calories: 0, color: 0, aroma: 0, taste: 0 }
    tiers.value = { calories: 0, color: 0, aroma: 0, taste: 0 }
    dishName.value = ''
    endingName.value = ''
    endingTags.value = []
    subComments.value = []
    techniqueSequence.value = []
    critCount.value = 0
    rareCombos.value = []
  }

  return {
    metrics, tiers, dishName, endingName, endingTags, subComments,
    techniqueSequence, critCount, rareCombos,
    computeFinalResult,
    $reset,
  }
})