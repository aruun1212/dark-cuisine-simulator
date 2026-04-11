/** Ingredient categories */
export type IngredientCategory =
  | 'meat'      // 肉类
  | 'egg_dairy' // 蛋奶类
  | 'staple'    // 主食类
  | 'sugar'     // 糖类
  | 'vegetable' // 蔬菜类
  | 'fruit'     // 水果类
  | 'oil'       // 油脂类
  | 'seasoning' // 调味料类

/** Technique schools */
export type TechniqueSchool =
  | 'heat'    // 加热：煎炒炸烤
  | 'process' // 处理：切腌榨发酵
  | 'season'  // 调味：调味裹酱摆盘
  | 'combine' // 组合：裹粉混合熬煮

/** 4D metrics */
export interface Metrics {
  calories: number
  color: number
  aroma: number
  taste: number
}

/** Ingredient definition */
export interface Ingredient {
  id: string
  name: string
  emoji: string
  category: IngredientCategory
  baseModifiers: Metrics     // base contribution to the dish
  tags?: string[]            // optional special tags (e.g., '腥味', '膻味', '热带')
}

/** Technique card definition */
export interface TechniqueCard {
  id: string
  name: string
  emoji: string
  school: TechniqueSchool
  price: number              // 2-4 🔥
  baseEffects: Metrics       // normal execution effects
  critEffects: Metrics       // crit execution effects
  critName: string           // crit event display name (e.g., "完美焦化！")
  critTag?: string           // optional tag added on crit (e.g., "烟熏")
}

/** Ending definition */
export interface EndingDef {
  calorieTier: number        // 1-7
  qualityBucket: number      // 1-4 (low, mid, good, extreme)
  name: string
}

/** Tag ending definition */
export interface TagEndingDef {
  tag: string
  nameModifier?: string      // appended to ending name
  subComment?: string        // extra comment shown
}

/** Rare combo ending */
export interface RareComboDef {
  id: string
  name: string
  emoji: string
  check: (ctx: RareComboContext) => boolean
}

export interface RareComboContext {
  ingredientIds: string[]
  techniqueIds: string[]     // full execution history
  critCount: number
  metrics: Metrics
  tiers: { calories: number; color: number; aroma: number; taste: number }
}

/** Shopping style definition */
export interface ShoppingStyle {
  id: string
  name: string
  emoji: string
  /** Category weight distribution (must sum to ~1.0) */
  weights: Partial<Record<IngredientCategory, number>>
}

/** Game phase & cooking sub-phase (re-exported from store for convenience) */
export type GamePhase = 'home' | 'shopping' | 'cooking' | 'result'
export type CookingSubPhase = 'shop' | 'workbench' | 'execute'
