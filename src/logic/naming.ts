import { getTechniqueById } from '../data/techniques'
import { getIngredientById } from '../data/ingredients'
import { DISH_SUFFIX, DEFAULT_SUFFIX } from '../data/endings'

/**
 * Compress consecutive identical technique IDs into modifier words.
 * e.g., [fry, fry, fry] → "三重煎"
 * e.g., [chop, fry, fry, roast] → "切·双重煎·烤"
 */
function compressTechniques(techniqueIds: string[]): string {
  if (techniqueIds.length === 0) return ''

  const groups: { id: string; count: number }[] = []
  let current = techniqueIds[0]
  let count = 1

  for (let i = 1; i < techniqueIds.length; i++) {
    if (techniqueIds[i] === current) {
      count++
    } else {
      groups.push({ id: current, count })
      current = techniqueIds[i]
      count = 1
    }
  }
  groups.push({ id: current, count })

  return groups.map(g => {
    const tech = getTechniqueById(g.id)
    const name = tech?.name ?? g.id
    if (g.count === 1) return name
    if (g.count === 2) return `双重${name}`
    if (g.count === 3) return `三重${name}`
    if (g.count === 4) return `四重${name}`
    return `疯狂${name}` // 5+
  }).join('·')
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
