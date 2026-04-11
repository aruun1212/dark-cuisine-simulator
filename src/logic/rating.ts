import type { Metrics } from '../data/types'
import { lookupEnding, TAG_ENDINGS, RARE_COMBOS } from '../data/endings'
import type { RareComboContext } from '../data/types'

/** Calorie tier thresholds (tuned for 3-round / 6-slot / 10-ingredient economy) */
function getCalorieTier(value: number): number {
  if (value < 0) return 1
  if (value <= 30) return 2
  if (value <= 100) return 3
  if (value <= 200) return 4
  if (value <= 350) return 5
  if (value <= 500) return 6
  return 7
}

/** Quality dimension tier thresholds (tuned for 3-round / 6-slot / 10-ingredient economy) */
function getQualityTier(value: number): number {
  if (value < 0) return 1
  if (value <= 15) return 2
  if (value <= 40) return 3
  if (value <= 80) return 4
  if (value <= 130) return 5
  if (value <= 180) return 6
  return 7
}

export interface TierResult {
  calories: number
  color: number
  aroma: number
  taste: number
}

export function computeTiers(metrics: Metrics): TierResult {
  return {
    calories: getCalorieTier(metrics.calories),
    color: getQualityTier(metrics.color),
    aroma: getQualityTier(metrics.aroma),
    taste: getQualityTier(metrics.taste),
  }
}

/** Aggregate quality tiers into 4 buckets: 1=low, 2=mid, 3=good, 4=extreme */
export function computeQualityBucket(tiers: TierResult): number {
  const avg = (tiers.color + tiers.aroma + tiers.taste) / 3
  if (avg <= 2) return 1      // low
  if (avg <= 4) return 2      // mid
  if (avg <= 5) return 3      // good
  return 4                     // extreme
}

/** Determine main ending name */
export function determineEnding(metrics: Metrics): {
  endingName: string
  tiers: TierResult
  qualityBucket: number
} {
  const tiers = computeTiers(metrics)
  const qualityBucket = computeQualityBucket(tiers)
  const endingName = lookupEnding(tiers.calories, qualityBucket)
  return { endingName, tiers, qualityBucket }
}

/** Process hidden tags → name modifiers and sub-comments */
export function processTagEndings(tags: string[]): {
  nameModifiers: string[]
  subComments: string[]
} {
  const nameModifiers: string[] = []
  const subComments: string[] = []

  for (const tag of tags) {
    const def = TAG_ENDINGS.find(t => t.tag === tag)
    if (def) {
      if (def.nameModifier) nameModifiers.push(def.nameModifier)
      if (def.subComment) subComments.push(def.subComment)
    }
  }

  return { nameModifiers, subComments }
}

/** Check rare combo endings */
export function checkRareCombos(ctx: RareComboContext): string[] {
  return RARE_COMBOS
    .filter(combo => combo.check(ctx))
    .map(combo => combo.id)
}
