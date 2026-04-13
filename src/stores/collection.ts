import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDING_MATRIX, TAG_ENDINGS, RARE_COMBOS } from '../data/endings'
import { TECHNIQUES } from '../data/techniques'

const STORAGE_KEY = 'dcs_collection'

export interface CollectionData {
  mainEndings: Record<string, boolean>    // ending key -> unlocked
  tagEndings: Record<string, boolean>     // tag key -> unlocked
  critEvents: Record<string, boolean>     // technique id -> unlocked
  rareCombos: Record<string, boolean>     // combo key -> unlocked
}

function loadFromStorage(): CollectionData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { mainEndings: {}, tagEndings: {}, critEvents: {}, rareCombos: {} }
}

// Totals for progress tracking
const TOTAL_MAIN_ENDINGS = ENDING_MATRIX.length    // 28
const TOTAL_TAG_ENDINGS = TAG_ENDINGS.length        // 12
const TOTAL_CRIT_EVENTS = TECHNIQUES.length          // 14
const TOTAL_RARE_COMBOS = RARE_COMBOS.length         // 8
const TOTAL_ALL = TOTAL_MAIN_ENDINGS + TOTAL_TAG_ENDINGS + TOTAL_CRIT_EVENTS + TOTAL_RARE_COMBOS

export interface NewUnlocks {
  mainEndings: string[]
  tagEndings: string[]
  critEvents: string[]
  rareCombos: string[]
}

export const useCollectionStore = defineStore('collection', () => {
  const data = ref<CollectionData>(loadFromStorage())

  // Track newly unlocked items in the current game session
  const newUnlocks = ref<NewUnlocks>({
    mainEndings: [], tagEndings: [], critEvents: [], rareCombos: [],
  })

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  }

  /** Clear session new-unlock markers (call at game start) */
  function clearNewUnlocks() {
    newUnlocks.value = { mainEndings: [], tagEndings: [], critEvents: [], rareCombos: [] }
  }

  const hasNewUnlocks = computed(() => {
    const n = newUnlocks.value
    return n.mainEndings.length + n.tagEndings.length + n.critEvents.length + n.rareCombos.length > 0
  })

  // ═══════ Unlock methods ═══════
  function unlockEnding(endingName: string) {
    if (!data.value.mainEndings[endingName]) {
      data.value.mainEndings[endingName] = true
      newUnlocks.value.mainEndings.push(endingName)
      save()
    }
  }

  function unlockTag(tag: string) {
    if (!data.value.tagEndings[tag]) {
      data.value.tagEndings[tag] = true
      newUnlocks.value.tagEndings.push(tag)
      save()
    }
  }

  function unlockCrit(techniqueId: string) {
    if (!data.value.critEvents[techniqueId]) {
      data.value.critEvents[techniqueId] = true
      newUnlocks.value.critEvents.push(techniqueId)
      save()
    }
  }

  function unlockRareCombo(comboId: string) {
    if (!data.value.rareCombos[comboId]) {
      data.value.rareCombos[comboId] = true
      newUnlocks.value.rareCombos.push(comboId)
      save()
    }
  }

  // ═══════ Progress computed ═══════
  const mainEndingCount = computed(() => Object.values(data.value.mainEndings).filter(Boolean).length)
  const tagEndingCount = computed(() => Object.values(data.value.tagEndings).filter(Boolean).length)
  const critEventCount = computed(() => Object.values(data.value.critEvents).filter(Boolean).length)
  const rareComboCount = computed(() => Object.values(data.value.rareCombos).filter(Boolean).length)

  const totalUnlocked = computed(() =>
    mainEndingCount.value + tagEndingCount.value + critEventCount.value + rareComboCount.value
  )

  const totalItems = TOTAL_ALL
  const progressPercent = computed(() =>
    totalItems > 0 ? Math.round((totalUnlocked.value / totalItems) * 1000) / 10 : 0
  )

  return {
    data, newUnlocks, hasNewUnlocks,
    unlockEnding, unlockTag, unlockCrit, unlockRareCombo, clearNewUnlocks,
    mainEndingCount, tagEndingCount, critEventCount, rareComboCount,
    totalUnlocked, totalItems, progressPercent,
    TOTAL_MAIN_ENDINGS, TOTAL_TAG_ENDINGS, TOTAL_CRIT_EVENTS, TOTAL_RARE_COMBOS,
    save,
  }
})