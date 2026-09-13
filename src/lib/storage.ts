import type { AppState, HistoryEntry, Prize, Settings } from '../types'

const KEY = 'lucky-draw:v1'

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  removeWinner: true, // 29절 — 기본 ON
  useWeights: false,
}

export const EMPTY_STATE: AppState = { prizes: [], history: [], settings: DEFAULT_SETTINGS }

function isPrize(v: unknown): v is Prize {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.emoji === 'string' &&
    typeof p.color === 'string' &&
    typeof p.quantity === 'number' &&
    Number.isFinite(p.quantity) &&
    p.quantity >= 0 &&
    (p.weight === undefined || (typeof p.weight === 'number' && Number.isFinite(p.weight)))
  )
}

function isHistoryEntry(v: unknown): v is HistoryEntry {
  if (typeof v !== 'object' || v === null) return false
  const h = v as Record<string, unknown>
  return (
    typeof h.id === 'string' &&
    typeof h.prizeName === 'string' &&
    typeof h.emoji === 'string' &&
    typeof h.color === 'string' &&
    typeof h.at === 'string'
  )
}

function readSettings(v: unknown): Settings {
  if (typeof v !== 'object' || v === null) return DEFAULT_SETTINGS
  const s = v as Record<string, unknown>
  return {
    sound: typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound,
    removeWinner:
      typeof s.removeWinner === 'boolean' ? s.removeWinner : DEFAULT_SETTINGS.removeWinner,
    useWeights: typeof s.useWeights === 'boolean' ? s.useWeights : DEFAULT_SETTINGS.useWeights,
  }
}

/**
 * 브라우저 저장소는 신뢰하지 않는다. 시크릿 모드·사이트 데이터 차단·용량 초과에서는
 * localStorage 접근 자체가 throw하므로, load()는 어떤 경우에도 던지지 않고
 * 최악의 경우 빈 상태를 반환한다. 항목 단위로 검증해 한 건이 깨져도 나머지는 살린다.
 */
export function load(): AppState {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return EMPTY_STATE
  }
  if (!raw) return EMPTY_STATE

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return EMPTY_STATE
  }
  if (typeof parsed !== 'object' || parsed === null) return EMPTY_STATE

  const data = parsed as Record<string, unknown>
  return {
    prizes: Array.isArray(data.prizes) ? data.prizes.filter(isPrize) : [],
    history: Array.isArray(data.history) ? data.history.filter(isHistoryEntry) : [],
    settings: readSettings(data.settings),
  }
}

/** 저장 실패는 무시한다 — 화면 동작을 막지 않는다. */
export function save(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* 저장소를 못 쓰는 환경에서도 추첨은 계속 돌아간다 */
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* 위와 같음 */
  }
}
