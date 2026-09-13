/** 경품 한 건. `weight`는 확률 설정(13절)을 켰을 때만 의미가 있다. */
export type Prize = {
  id: string
  name: string
  emoji: string
  quantity: number
  color: string
  weight?: number
}

/** 당첨 기록 한 줄. 경품이 지워져도 기록은 남아야 하므로 값을 복사해 둔다. */
export type HistoryEntry = {
  id: string
  prizeName: string
  emoji: string
  color: string
  at: string // ISO 8601 — JSON에 Date를 담을 수 없어 경계에서 문자열로 바꾼다
}

export type Settings = {
  sound: boolean
  /** 당첨 시 수량을 차감할지. 끄면 같은 경품이 계속 당첨될 수 있다. (29절) */
  removeWinner: boolean
  /** 켜면 `Prize.weight`를 확률(%)로 사용한다. 끄면 전 경품 균등. (13절) */
  useWeights: boolean
}

export type AppState = {
  prizes: Prize[]
  history: HistoryEntry[]
  settings: Settings
}
