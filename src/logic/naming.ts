import { getTechniqueById, TECHNIQUES } from '../data/techniques'
import { getIngredientById } from '../data/ingredients'
import { DISH_SUFFIX, DEFAULT_SUFFIX } from '../data/endings'

/** Default technique sort order (index in TECHNIQUES array) */
const TECH_ORDER: Record<string, number> = {}
TECHNIQUES.forEach((t, i) => { TECH_ORDER[t.id] = i })

/**
 * Count all occurrences of each technique across the entire sequence,
 * sort by default technique order, and join WITHOUT separators.
 * e.g., [chop, fry, fry, roast] → "切双重煎烤"
 * e.g., [fry, roast, fry, roast] → "双重煎双重烤"
 */
function compressTechniques(techniqueIds: string[]): string {
  if (techniqueIds.length === 0) return ''

  // Count total occurrences of each technique
  const countMap: Record<string, number> = {}
  for (const id of techniqueIds) {
    countMap[id] = (countMap[id] || 0) + 1
  }

  // Sort by default technique order
  const sortedIds = Object.keys(countMap).sort(
    (a, b) => (TECH_ORDER[a] ?? 99) - (TECH_ORDER[b] ?? 99)
  )

  return sortedIds.map(id => {
    const tech = getTechniqueById(id)
    const name = tech?.name ?? id
    const count = countMap[id]
    if (count === 1) return name
    if (count === 2) return `双重${name}`
    if (count === 3) return `三重${name}`
    if (count === 4) return `四重${name}`
    return `疯狂${name}` // 5+
  }).join('')
}

/**
 * Generate ingredient word from the basket.
 * 1-2 types → list both; 3-4 → top 2 + "什锦"; 5+ → top 1 + "大杂烩"
 */
function generateIngredientWord(ingredientIds: string[]): string {
  const unique = [...new Set(ingredientIds)]
  if (unique.length === 0) return ''

  const names = unique.map(id => getIngredientById(id)?.name ?? id)

  if (names.length <= 2) {
    return names.join('')
  }
  if (names.length <= 4) {
    return names.slice(0, 2).join('') + '什锦'
  }
  return names[0] + '大杂烩'
}

/**
 * Get dish suffix from the last technique executed.
 */
function getSuffix(techniqueIds: string[]): string {
  if (techniqueIds.length === 0) return DEFAULT_SUFFIX
  const lastId = techniqueIds[techniqueIds.length - 1]
  return DISH_SUFFIX[lastId] || DEFAULT_SUFFIX
}

/**
 * Generate the full dish name.
 */
export function generateDishName(
  techniqueIds: string[],
  ingredientIds: string[],
): string {
  const techModifier = compressTechniques(techniqueIds)
  const ingredientWord = generateIngredientWord(ingredientIds)
  const suffix = getSuffix(techniqueIds)

  return `${techModifier}${ingredientWord}${suffix}`
}
