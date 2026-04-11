import type { TechniqueCard } from './types'

export type { TechniqueCard } from './types'

export const TECHNIQUES: TechniqueCard[] = [
  // ═══════ 🔥 加热 (heat) ═══════
  {
    id: 'fry', name: '煎', emoji: '🍳', school: 'heat', price: 3,
    baseEffects: { calories: 20, color: 15, aroma: 20, taste: 10 },
    critEffects: { calories: 25, color: 35, aroma: 40, taste: 10 },
    critName: '完美焦化！',
  },
  {
    id: 'stir_fry', name: '炒', emoji: '🥘', school: 'heat', price: 3,
    baseEffects: { calories: 15, color: 10, aroma: 15, taste: 15 },
    critEffects: { calories: 15, color: 20, aroma: 25, taste: 25 },
    critName: '颠勺大师！',
  },
  {
    id: 'deep_fry', name: '炸', emoji: '🍟', school: 'heat', price: 4,
    baseEffects: { calories: 40, color: 20, aroma: 15, taste: 10 },
    critEffects: { calories: 45, color: 50, aroma: 15, taste: 35 },
    critName: '黄金炸物！',
  },
  {
    id: 'roast', name: '烤', emoji: '🔥', school: 'heat', price: 3,
    baseEffects: { calories: 20, color: 15, aroma: 25, taste: 15 },
    critEffects: { calories: 20, color: 15, aroma: 50, taste: 15 },
    critName: '炭火之神！', critTag: '烟熏',
  },

  // ═══════ 🔪 处理 (process) ═══════
  {
    id: 'chop', name: '切', emoji: '🔪', school: 'process', price: 2,
    baseEffects: { calories: 0, color: 15, aroma: 5, taste: 5 },
    critEffects: { calories: 0, color: 45, aroma: 5, taste: 20 },
    critName: '厨神附体！', critTag: '刀工',
  },
  {
    id: 'marinate', name: '腌', emoji: '🫙', school: 'process', price: 3,
    baseEffects: { calories: 5, color: 5, aroma: 10, taste: 25 },
    critEffects: { calories: 5, color: 5, aroma: 10, taste: 50 },
    critName: '入味三分！', critTag: '入味',
  },
  {
    id: 'juice', name: '榨', emoji: '🧃', school: 'process', price: 2,
    baseEffects: { calories: -10, color: 15, aroma: 10, taste: 10 },
    critEffects: { calories: -15, color: 35, aroma: 10, taste: 10 },
    critName: '鲜榨精华！',
  },
  {
    id: 'ferment', name: '发酵', emoji: '🧫', school: 'process', price: 3,
    baseEffects: { calories: 5, color: 5, aroma: 20, taste: 15 },
    critEffects: { calories: 5, color: 5, aroma: 40, taste: 15 },
    critName: '微生物奇迹！', critTag: '陈酿',
  },

  // ═══════ 🎨 调味 (season) ═══════
  {
    id: 'season', name: '调味', emoji: '🧂', school: 'season', price: 2,
    baseEffects: { calories: 0, color: 10, aroma: 10, taste: 20 },
    critEffects: { calories: 0, color: 35, aroma: 35, taste: 45 },
    critName: '神之一手！', critTag: '五味俱全',
  },
  {
    id: 'glaze', name: '裹酱', emoji: '🍯', school: 'season', price: 3,
    baseEffects: { calories: 10, color: 25, aroma: 10, taste: 15 },
    critEffects: { calories: 10, color: 65, aroma: 10, taste: 15 },
    critName: '琉璃光泽！', critTag: '光泽',
  },
  {
    id: 'plate', name: '摆盘', emoji: '🎨', school: 'season', price: 2,
    baseEffects: { calories: 0, color: 25, aroma: 5, taste: 5 },
    critEffects: { calories: 0, color: 50, aroma: 5, taste: 5 },
    critName: '米其林摆盘！', critTag: '艺术品',
  },

  // ═══════ 🔗 组合 (combine) ═══════
  {
    id: 'batter', name: '裹粉', emoji: '🌾', school: 'combine', price: 2,
    baseEffects: { calories: 10, color: 5, aroma: 5, taste: 5 },
    critEffects: { calories: 10, color: 10, aroma: 10, taste: 10 },
    critName: '完美粉浆！',
    // Special: next heat card effect ×1.2 (handled in pipeline logic)
  },
  {
    id: 'mix', name: '混合', emoji: '🥣', school: 'combine', price: 3,
    baseEffects: { calories: 5, color: 10, aroma: 10, taste: 10 },
    critEffects: { calories: 5, color: 30, aroma: 30, taste: 30 },
    critName: '完美融合！', critTag: '融合',
  },
  {
    id: 'stew', name: '熬煮', emoji: '🍲', school: 'combine', price: 4,
    baseEffects: { calories: 15, color: 10, aroma: 15, taste: 25 },
    critEffects: { calories: 15, color: 10, aroma: 30, taste: 50 },
    critName: '至臻浓汤！',
  },
]

/** Get technique by id */
export function getTechniqueById(id: string): TechniqueCard | undefined {
  return TECHNIQUES.find(t => t.id === id)
}
