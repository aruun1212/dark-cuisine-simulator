import type { EndingDef, TagEndingDef, RareComboDef } from './types'

// ═══════ 7×4 Ending Matrix ═══════
// calorieTier (1-7) × qualityBucket (1=low, 2=mid, 3=good, 4=extreme)
export const ENDING_MATRIX: EndingDef[] = [
  // Tier 1: Negative calories
  { calorieTier: 1, qualityBucket: 1, name: '反物质残渣' },
  { calorieTier: 1, qualityBucket: 2, name: '量子减脂餐' },
  { calorieTier: 1, qualityBucket: 3, name: '负卡路里奇迹' },
  { calorieTier: 1, qualityBucket: 4, name: '时空裂缝美食' },
  // Tier 2: Very low (0-50)
  { calorieTier: 2, qualityBucket: 1, name: '空气料理' },
  { calorieTier: 2, qualityBucket: 2, name: '断食修行餐' },
  { calorieTier: 2, qualityBucket: 3, name: '精致轻食' },
  { calorieTier: 2, qualityBucket: 4, name: '仙人的食粮' },
  // Tier 3: Low (51-150)
  { calorieTier: 3, qualityBucket: 1, name: '敷衍沙拉' },
  { calorieTier: 3, qualityBucket: 2, name: '健康便当' },
  { calorieTier: 3, qualityBucket: 3, name: '完美减脂餐' },
  { calorieTier: 3, qualityBucket: 4, name: '米其林轻食' },
  // Tier 4: Medium (151-300)
  { calorieTier: 4, qualityBucket: 1, name: '食堂日常' },
  { calorieTier: 4, qualityBucket: 2, name: '家常便饭' },
  { calorieTier: 4, qualityBucket: 3, name: '妈妈的味道' },
  { calorieTier: 4, qualityBucket: 4, name: '主厨推荐' },
  // Tier 5: High (301-500)
  { calorieTier: 5, qualityBucket: 1, name: '暗黑盖浇饭' },
  { calorieTier: 5, qualityBucket: 2, name: '深夜食堂' },
  { calorieTier: 5, qualityBucket: 3, name: '丰盛大餐' },
  { calorieTier: 5, qualityBucket: 4, name: '满汉全席' },
  // Tier 6: Very high (501-800)
  { calorieTier: 6, qualityBucket: 1, name: '热量核弹' },
  { calorieTier: 6, qualityBucket: 2, name: '增肌餐Pro' },
  { calorieTier: 6, qualityBucket: 3, name: '饕餮盛宴' },
  { calorieTier: 6, qualityBucket: 4, name: '神之料理' },
  // Tier 7: Extreme (800+)
  { calorieTier: 7, qualityBucket: 1, name: '人类不需要这个' },
  { calorieTier: 7, qualityBucket: 2, name: '卡路里黑洞' },
  { calorieTier: 7, qualityBucket: 3, name: '终极热量炸弹' },
  { calorieTier: 7, qualityBucket: 4, name: '开天辟地大餐' },
]

// ═══════ Tag Ending Modifiers ═══════
export const TAG_ENDINGS: TagEndingDef[] = [
  { tag: '烟熏', nameModifier: '（带烟熏风味）' },
  { tag: '刀工', subComment: '刀工精湛，视觉满分' },
  { tag: '五味俱全', subComment: '五味调和，堪称完美' },
  { tag: '艺术品', subComment: '好看到不忍心吃' },
  { tag: '陈酿', nameModifier: '（古法酿造）' },
  { tag: '光泽', subComment: '光泽诱人，口水直流' },
  { tag: '融合', subComment: '融合之道，万物归一' },
  { tag: '入味', subComment: '入味三分，回味无穷' },
  { tag: '过咸', nameModifier: '（咸到怀疑人生）' },
  { tag: '腥味', subComment: '一股说不清的味道…' },
  { tag: '膻味', subComment: '草原的气息扑面而来' },
  { tag: '热带', subComment: '仿佛置身热带海滩' },
]

// ═══════ Rare Combo Endings ═══════
export const RARE_COMBOS: RareComboDef[] = [
  {
    id: 'lava_cake', name: '岩浆蛋糕', emoji: '🌋',
    check: (ctx) => {
      const hasEgg = ctx.ingredientIds.includes('egg')
      const hasSugar = ctx.ingredientIds.some(id => ['white_sugar', 'brown_sugar', 'honey', 'chocolate', 'syrup'].includes(id))
      const hasButter = ctx.ingredientIds.includes('butter')
      const roastCount = ctx.techniqueIds.filter(id => id === 'roast').length
      return hasEgg && hasSugar && hasButter && roastCount >= 2
    },
  },
  {
    id: 'molecular', name: '分子料理', emoji: '🧊',
    check: (ctx) => {
      const hasFruit = ctx.ingredientIds.some(id => ['lemon', 'apple', 'banana', 'pineapple', 'mango'].includes(id))
      const hasFerment = ctx.techniqueIds.includes('ferment')
      const hasJuice = ctx.techniqueIds.includes('juice')
      const hasPlate = ctx.techniqueIds.includes('plate')
      const noHeat = !ctx.techniqueIds.some(id => ['fry', 'stir_fry', 'deep_fry', 'roast'].includes(id))
      return hasFruit && hasFerment && hasJuice && hasPlate && noHeat
    },
  },
  {
    id: 'hell_hotpot', name: '地狱火锅', emoji: '🔥',
    check: (ctx) => {
      const hasChili = ctx.ingredientIds.includes('chili')
      const hasPepper = ctx.ingredientIds.includes('pepper')
      const hasMeat = ctx.ingredientIds.some(id => ['pork', 'beef', 'chicken', 'lamb', 'fish'].includes(id))
      const hasStew = ctx.techniqueIds.includes('stew')
      return hasChili && hasPepper && hasMeat && hasStew
    },
  },
  {
    id: 'dark_sushi', name: '黑暗寿司', emoji: '🍣',
    check: (ctx) => {
      const hasRice = ctx.ingredientIds.includes('rice')
      const hasEgg = ctx.ingredientIds.some(id => ['egg', 'duck_egg'].includes(id))
      const hasChop = ctx.techniqueIds.includes('chop')
      const hasPlate = ctx.techniqueIds.includes('plate')
      const noHeat = !ctx.techniqueIds.some(id => ['fry', 'stir_fry', 'deep_fry', 'roast'].includes(id))
      return hasRice && hasEgg && hasChop && hasPlate && noHeat
    },
  },
  {
    id: 'lab_product', name: '实验室产物', emoji: '🧪',
    check: (ctx) => ctx.critCount >= 3,
  },
  {
    id: 'chaos_cake', name: '混沌蛋糕', emoji: '🎂',
    check: (ctx) => {
      const uniqueIngredients = new Set(ctx.ingredientIds).size
      const hasMix = ctx.techniqueIds.includes('mix')
      return uniqueIngredients >= 6 && hasMix
    },
  },
  {
    id: 'pure_dark', name: '纯黑料理', emoji: '💀',
    check: (ctx) => {
      return ctx.tiers.calories <= 1 && ctx.tiers.color <= 1 && ctx.tiers.aroma <= 1 && ctx.tiers.taste <= 1
    },
  },
  {
    id: 'perfect_balance', name: '完美平衡', emoji: '👼',
    check: (ctx) => {
      return ctx.tiers.calories === 4 && ctx.tiers.color === 4 && ctx.tiers.aroma === 4 && ctx.tiers.taste === 4
    },
  },
]

// ═══════ Dish Suffix Mapping ═══════
export const DISH_SUFFIX: Record<string, string> = {
  fry: '煎物',
  stir_fry: '小炒',
  deep_fry: '炸物',
  roast: '烤串',
  season: '料理',
  glaze: '酱烧',
  plate: '拼盘',
  stew: '炖菜',
  chop: '料理',
  marinate: '料理',
  juice: '鲜榨',
  ferment: '酿品',
  batter: '料理',
  mix: '大拌菜',
}

export const DEFAULT_SUFFIX = '料理'

/** Look up ending from matrix */
export function lookupEnding(calorieTier: number, qualityBucket: number): string {
  const entry = ENDING_MATRIX.find(e => e.calorieTier === calorieTier && e.qualityBucket === qualityBucket)
  return entry?.name ?? '未知料理'
}
