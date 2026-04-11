import type { ShoppingStyle } from './types'

export const SHOPPING_STYLES: ShoppingStyle[] = [
  {
    id: 'carnivore', name: '肉食主义', emoji: '🥩',
    weights: { meat: 0.40, oil: 0.25, seasoning: 0.20, staple: 0.10, egg_dairy: 0.05 },
  },
  {
    id: 'dessert', name: '甜品路线', emoji: '🍰',
    weights: { sugar: 0.30, egg_dairy: 0.25, fruit: 0.25, oil: 0.20 },
  },
  {
    id: 'health', name: '健康轻食', emoji: '🥗',
    weights: { vegetable: 0.35, fruit: 0.30, seasoning: 0.20, egg_dairy: 0.15 },
  },
  {
    id: 'carb_bomb', name: '碳水炸弹', emoji: '🍜',
    weights: { staple: 0.35, oil: 0.25, sugar: 0.20, egg_dairy: 0.20 },
  },
  {
    id: 'hodgepodge', name: '大杂烩', emoji: '🎲',
    weights: {
      meat: 0.125, egg_dairy: 0.125, staple: 0.125, sugar: 0.125,
      vegetable: 0.125, fruit: 0.125, oil: 0.125, seasoning: 0.125,
    },
  },
]
