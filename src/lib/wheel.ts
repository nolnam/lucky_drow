import type { Prize, Settings } from '../types'
import { random, weightedIndex } from './random'

/**
 * 원판에 실제로 그려지는 한 칸. `prizes`에서 매번 유도하며 따로 들고 있지 않는다.
 * 호의 크기(sweep)와 당첨 확률은 같은 share에서 나오므로 언제나 일치한다.
 */
export type Segment = {
  prize: Prize
  share: number // 정규화된 몫 (합 = 1)
  start: number // 포인터(12시)에서 시계방향으로 잰 시작 각도
  sweep: number
}

/** 확률 설정이 켜져 있고 가중치 합이 유효할 때만 weight를 쓴다. */
function shareOf(prize: Prize, settings: Settings): number {
  if (!settings.useWeights) return 1
  const w = prize.weight
  return typeof w === 'number' && w > 0 ? w : 0
}

/** 수량 0은 원판에서 빠진다. (11절) */
export function spinnablePrizes(prizes: Prize[]): Prize[] {
  return prizes.filter((p) => p.quantity > 0)
}

export function buildSegments(prizes: Prize[], settings: Settings): Segment[] {
  const pool = spinnablePrizes(prizes)
  if (pool.length === 0) return []

  const raw = pool.map((p) => shareOf(p, settings))
  const total = raw.reduce((sum, w) => sum + w, 0)
  // 가중치를 켰지만 전부 0이면 균등으로 되돌린다 — 빈 원판보다 낫다.
  const shares = total > 0 ? raw.map((w) => w / total) : raw.map(() => 1 / pool.length)

  let cursor = 0
  return pool.map((prize, i) => {
    const sweep = shares[i] * 360
    const segment: Segment = { prize, share: shares[i], start: cursor, sweep }
    cursor += sweep
    return segment
  })
}

/** 포인터(12시) 아래에 있는 세그먼트의 인덱스. 회전값은 시계방향 누적 각도다. */
export function segmentAtPointer(segments: Segment[], rotation: number): number {
  if (segments.length === 0) return -1
  // 원판이 +rotation 만큼 돌면, 포인터가 가리키는 지점은 -rotation 위치의 세그먼트다.
  const angle = ((-rotation % 360) + 360) % 360
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    if (angle >= s.start && angle < s.start + s.sweep) return i
  }
  return segments.length - 1
}

export type SpinPlan = {
  winnerIndex: number
  targetRotation: number
  durationMs: number
}

/**
 * 당첨자를 먼저 뽑고, 그 칸이 포인터 아래 오도록 최종 각도를 역산한다. (37절)
 * 멈춘 위치를 읽어서 당첨자를 정하는 반대 방향으로 바꾸면 확률·수량 처리가 어긋난다.
 */
export function planSpin(segments: Segment[], currentRotation: number): SpinPlan | null {
  if (segments.length === 0) return null

  const winnerIndex = weightedIndex(segments.map((s) => s.share))
  const winner = segments[winnerIndex]

  // 항상 정중앙에 멈추면 티가 나므로 칸 안에서 살짝 흔든다 (가장자리 10%는 피한다).
  const jitter = (random() - 0.5) * winner.sweep * 0.8
  const landing = winner.start + winner.sweep / 2 + jitter

  // rotation ≡ -landing (mod 360) 이 되도록 남은 각도를 더한다.
  const needed = ((-landing - currentRotation) % 360 + 360) % 360
  const turns = 4 + Math.floor(random() * 2) // 최소 3회전 요구를 여유 있게 넘긴다

  return {
    winnerIndex,
    targetRotation: currentRotation + turns * 360 + needed,
    durationMs: 3800 + random() * 900, // 3~5초 (6절)
  }
}

/** 빠르게 시작해 자연스럽게 감속. (6절) */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}
