import type { Ingredient } from './types'

export const INGREDIENTS: Ingredient[] = [
  // ═══════ 🥩 肉类 (meat) ═══════
  { id: 'pork',    name: '猪肉', emoji: '🥩', category: 'meat', baseModifiers: { calories: 30, color: 5, aroma: 15, taste: 10 } },
  { id: 'beef',    name: '牛肉', emoji: '🥩', category: 'meat', baseModifiers: { calories: 35, color: 5, aroma: 20, taste: 15 } },
  { id: 'fish',    name: '鱼肉', emoji: '🐟', category: 'meat', baseModifiers: { calories: 15, color: 10, aroma: 10, taste: 20 }, tags: ['腥味'] },

  // ═══════ 🥚 蛋奶类 (egg_dairy) ═══════
  { id: 'egg',          name: '鸡蛋', emoji: '🥚', category: 'egg_dairy', baseModifiers: { calories: 15, color: 10, aroma: 5, taste: 10 } },
  { id: 'milk',         name: '牛奶', emoji: '🥛', category: 'egg_dairy', baseModifiers: { calories: 10, color: 15, aroma: 10, taste: 10 } },
  { id: 'coconut_milk', name: '椰奶', emoji: '🥥', category: 'egg_dairy', baseModifiers: { calories: 20, color: 10, aroma: 15, taste: 15 }, tags: ['热带'] },

  // ═══════ 🍚 主食类 (staple) ═══════
  { id: 'rice',   name: '米饭', emoji: '🍚', category: 'staple', baseModifiers: { calories: 25, color: 5, aroma: 5, taste: 5 } },
  { id: 'flour',  name: '面粉', emoji: '🌾', category: 'staple', baseModifiers: { calories: 20, color: 5, aroma: 0, taste: 0 } },
  { id: 'potato', name: '土豆', emoji: '🥔', category: 'staple', baseModifiers: { calories: 20, color: 5, aroma: 5, taste: 5 } },

  // ═══════ 🍬 糖类 (sugar) ═══════
  { id: 'white_sugar', name: '白糖',   emoji: '🍬', category: 'sugar', baseModifiers: { calories: 20, color: 5, aroma: 0, taste: 15 } },
  { id: 'honey',       name: '蜂蜜',   emoji: '🍯', category: 'sugar', baseModifiers: { calories: 15, color: 15, aroma: 15, taste: 20 } },
  { id: 'chocolate',   name: '巧克力', emoji: '🍫', category: 'sugar', baseModifiers: { calories: 25, color: 20, aroma: 20, taste: 20 } },

  // ═══════ 🥬 蔬菜类 (vegetable) ═══════
  { id: 'cabbage',  name: '白菜', emoji: '🥬', category: 'vegetable', baseModifiers: { calories: -5, color: 10, aroma: 5, taste: 5 } },
  { id: 'tomato',   name: '番茄', emoji: '🍅', category: 'vegetable', baseModifiers: { calories: -5, color: 20, aroma: 10, taste: 15 } },
  { id: 'mushroom', name: '蘑菇', emoji: '🍄', category: 'vegetable', baseModifiers: { calories: -5, color: 5, aroma: 20, taste: 15 } },

  // ═══════ 🍋 水果类 (fruit) ═══════
  { id: 'lemon',     name: '柠檬', emoji: '🍋', category: 'fruit', baseModifiers: { calories: -10, color: 15, aroma: 15, taste: 10 } },
  { id: 'banana',    name: '香蕉', emoji: '🍌', category: 'fruit', baseModifiers: { calories: 5, color: 15, aroma: 15, taste: 15 } },
  { id: 'pineapple', name: '菠萝', emoji: '🍍', category: 'fruit', baseModifiers: { calories: -5, color: 20, aroma: 15, taste: 20 }, tags: ['热带'] },

  // ═══════ 🧈 油脂类 (oil) ═══════
  { id: 'vegetable_oil', name: '植物油', emoji: '🫒', category: 'oil', baseModifiers: { calories: 40, color: 5, aroma: 5, taste: 0 } },
  { id: 'butter',        name: '黄油',   emoji: '🧈', category: 'oil', baseModifiers: { calories: 40, color: 15, aroma: 20, taste: 15 } },
  { id: 'sesame_oil',    name: '麻油',   emoji: '🥜', category: 'oil', baseModifiers: { calories: 35, color: 5, aroma: 25, taste: 10 } },

  // ═══════ 🧂 调味料类 (seasoning) ═══════
  { id: 'salt',  name: '盐',   emoji: '🧂', category: 'seasoning', baseModifiers: { calories: 0, color: 0, aroma: 5, taste: 25 } },
  { id: 'chili', name: '辣椒', emoji: '🌶️', category: 'seasoning', baseModifiers: { calories: 0, color: 15, aroma: 15, taste: 15 } },
  { id: 'garlic', name: '蒜',  emoji: '🧄', category: 'seasoning', baseModifiers: { calories: 0, color: 5, aroma: 20, taste: 15 } },
]

/** Get ingredients by category */
export function getIngredientsByCategory(category: Ingredient['category']): Ingredient[] {
  return INGREDIENTS.filter(i => i.category === category)
}

/** Get ingredient by id */
export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id)
}

/** Category display info */
export const CATEGORY_INFO: Record<Ingredient['category'], { name: string; emoji: string }> = {
  meat:      { name: '肉类', emoji: '🥩' },
  egg_dairy: { name: '蛋奶类', emoji: '🥚' },
  staple:    { name: '主食类', emoji: '🍚' },
  sugar:     { name: '糖类', emoji: '🍬' },
  vegetable: { name: '蔬菜类', emoji: '🥬' },
  fruit:     { name: '水果类', emoji: '🍋' },
  oil:       { name: '油脂类', emoji: '🧈' },
  seasoning: { name: '调味料', emoji: '🧂' },
}