import type { Metrics } from '../data/types'

/**
 * 厨神实时评判系统
 * 根据当前累积四维属性计算"黑暗程度"并返回对应梯度评语
 */

/** 评语梯度定义 */
const COMMENT_TIERS: { maxScore: number; comments: string[] }[] = [
  {
    // 正常区间 darkScore < 2
    maxScore: 2,
    comments: [
      '嗯…目前看起来很正常',
      '这道菜暂时还在人类认知范围内',
      '很好，一切都在掌控之中',
      '中规中矩，稳扎稳打',
    ],
  },
  {
    // 轻微异常 2 ≤ darkScore < 4
    maxScore: 4,
    comments: [
      '开始有点意思了…',
      '嗯？这个走向有点微妙',
      '我闻到了一丝冒险的气息',
      '食材们开始躁动了',
    ],
  },
  {
    // 中度异常 4 ≤ darkScore < 6
    maxScore: 6,
    comments: [
      '这个组合…很大胆！',
      '我的厨师直觉正在疯狂报警',
      '已经偏离正常料理的轨道了',
      '有人打了119吗？',
    ],
  },
  {
    // 高度异常 6 ≤ darkScore < 8
    maxScore: 8,
    comments: [
      '我闻到了混沌的气息…',
      '这不是料理，这是化学实验',
      '厨房需要紧急疏散',
      '食材们正在集体尖叫',
    ],
  },
  {
    // 极端 darkScore ≥ 8
    maxScore: Infinity,
    comments: [
      '这已经超越了料理的范畴！',
      '恭喜你打开了通往异世界的大门',
      '我已经看见深渊在凝视这道菜了',
      '这不是食物，这是一种哲学',
    ],
  },
]

/**
 * 计算黑暗程度评分 (tuned for 3-round / 6-slot / 10-ingredient economy)
 * darkScore = |calories偏离200的程度| / 80 + (max(色香味) - min(色香味)) / 25
 */
function calcDarkScore(metrics: Metrics): number {
  const calorieDeviation = Math.abs(metrics.calories - 200) / 80
  const sensoryValues = [metrics.color, metrics.aroma, metrics.taste]
  const sensorySpread = (Math.max(...sensoryValues) - Math.min(...sensoryValues)) / 25
  return calorieDeviation + sensorySpread
}

/**
 * 获取厨神评判评语
 * 纯函数，根据当前累积四维属性返回对应梯度评语
 */
export function getChefComment(metrics: Metrics): string {
  // 负卡路里直接进入极端梯度
  if (metrics.calories < 0) {
    const extremeTier = COMMENT_TIERS[COMMENT_TIERS.length - 1]
    return extremeTier.comments[Math.floor(Math.random() * extremeTier.comments.length)]
  }

  const darkScore = calcDarkScore(metrics)

  for (const tier of COMMENT_TIERS) {
    if (darkScore < tier.maxScore) {
      return tier.comments[Math.floor(Math.random() * tier.comments.length)]
    }
  }

  // Fallback to extreme tier
  const extremeTier = COMMENT_TIERS[COMMENT_TIERS.length - 1]
  return extremeTier.comments[Math.floor(Math.random() * extremeTier.comments.length)]
}
