import type { Prize } from '../types'
import { newId } from './random'

/** 17절 팔레트. 배정은 assignColor()를 거쳐 같은 색이 연달아 오지 않게 한다. */
export const PALETTE = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
] as const

/** 목록 끝에 붙일 색. 마지막 색과도, 첫 색과도 겹치지 않는 것을 고른다. */
export function assignColor(existing: Prize[]): string {
  const last = existing.at(-1)?.color
  const first = existing[0]?.color
  const candidates = PALETTE.filter((c) => c !== last && (existing.length < 2 || c !== first))
  const pool = candidates.length > 0 ? candidates : PALETTE

  // 가장 적게 쓰인 색을 우선한다 — 목록이 길어져도 색이 고루 퍼진다.
  const counts = new Map<string, number>(pool.map((c) => [c, 0]))
  for (const p of existing) {
    if (counts.has(p.color)) counts.set(p.color, counts.get(p.color)! + 1)
  }
  return [...counts.entries()].sort((a, b) => a[1] - b[1])[0][0]
}

export function makePrize(
  seed: { name: string; emoji: string; quantity?: number },
  existing: Prize[],
): Prize {
  return {
    id: newId(),
    name: seed.name,
    emoji: seed.emoji,
    quantity: seed.quantity ?? 1,
    color: assignColor(existing),
  }
}

/** 여러 건을 한 번에 만들 때도 색 배정이 서로를 보도록 누적시킨다. */
export function makePrizes(
  seeds: { name: string; emoji: string; quantity?: number }[],
  existing: Prize[],
): Prize[] {
  const acc = [...existing]
  const made: Prize[] = []
  for (const seed of seeds) {
    const prize = makePrize(seed, acc)
    acc.push(prize)
    made.push(prize)
  }
  return made
}

/** 21절 — 첫 방문자용 샘플. */
export const SAMPLE_SEEDS = [
  { name: '커피 쿠폰', emoji: '☕', quantity: 5 },
  { name: '치킨 쿠폰', emoji: '🍗', quantity: 3 },
  { name: '상품권', emoji: '🎫', quantity: 5 },
  { name: '배달 쿠폰', emoji: '🍔', quantity: 2 },
  { name: '에어팟', emoji: '🎧', quantity: 1 },
  { name: '꽝', emoji: '😅', quantity: 4 },
]

/** 4절 — 경품 추천 카테고리. */
export type RecommendationCategory = {
  id: string
  label: string
  emoji: string
  items: { name: string; emoji: string }[]
}

export const RECOMMENDATIONS: RecommendationCategory[] = [
  {
    id: 'company',
    label: '회사 행사',
    emoji: '🏢',
    items: [
      { name: '커피 쿠폰', emoji: '☕' },
      { name: '치킨 쿠폰', emoji: '🍗' },
      { name: '편의점 상품권', emoji: '🏪' },
      { name: '배달 앱 상품권', emoji: '🛵' },
      { name: '문화상품권', emoji: '🎫' },
      { name: '텀블러', emoji: '🥤' },
      { name: '무선 충전기', emoji: '🔌' },
    ],
  },
  {
    id: 'education',
    label: '교육 / 강의',
    emoji: '📚',
    items: [
      { name: '커피 쿠폰', emoji: '☕' },
      { name: '간식 세트', emoji: '🍪' },
      { name: '노트', emoji: '📓' },
      { name: '볼펜', emoji: '🖊️' },
      { name: '책', emoji: '📖' },
      { name: 'AI 서비스 이용권', emoji: '🤖' },
      { name: '모바일 상품권', emoji: '📱' },
    ],
  },
  {
    id: 'student',
    label: '학생 이벤트',
    emoji: '🎒',
    items: [
      { name: '아이스크림 쿠폰', emoji: '🍦' },
      { name: '편의점 상품권', emoji: '🏪' },
      { name: '문화상품권', emoji: '🎫' },
      { name: '간식 세트', emoji: '🍿' },
      { name: '문구 세트', emoji: '✏️' },
    ],
  },
  {
    id: 'premium',
    label: '프리미엄',
    emoji: '💎',
    items: [
      { name: '에어팟', emoji: '🎧' },
      { name: '스마트워치', emoji: '⌚' },
      { name: '태블릿', emoji: '📱' },
      { name: '백화점 상품권', emoji: '🛍️' },
      { name: '호텔 숙박권', emoji: '🏨' },
    ],
  },
  {
    id: 'fun',
    label: '재미',
    emoji: '🤪',
    items: [
      { name: '꽝', emoji: '😅' },
      { name: '박수 10번', emoji: '👏' },
      { name: '커피 심부름 면제', emoji: '🙌' },
      { name: '오늘의 행운왕', emoji: '👑' },
      { name: '사진 촬영권', emoji: '📸' },
      { name: '추가 추첨권', emoji: '🎟️' },
    ],
  },
]

/** 19절 경품 추가 폼에서 고를 이모지. */
export const EMOJI_CHOICES = [
  '🎁', '☕', '🍗', '🎫', '🍔', '🎧', '😅', '🍦', '🍪', '📓',
  '🖊️', '📖', '🤖', '📱', '⌚', '🛍️', '🏨', '👑', '🎟️', '🏪',
  '🛵', '🥤', '🔌', '🍿', '✏️', '👏', '📸', '🍕', '🧋', '💎',
]
