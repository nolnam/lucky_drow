/**
 * 추첨 신뢰도를 위해 crypto.getRandomValues()를 우선 쓴다. (30절)
 * 구형 브라우저나 비보안 컨텍스트에서는 Math.random()으로 떨어진다.
 */
export function random(): number {
  const c = globalThis.crypto
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1)
    c.getRandomValues(buf)
    return buf[0] / 0x1_0000_0000
  }
  return Math.random()
}

/** 가중치 배열에서 인덱스 하나를 고른다. 가중치 합이 0이면 균등으로 떨어진다. */
export function weightedIndex(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0)
  if (total <= 0) return Math.floor(random() * weights.length)

  let roll = random() * total
  for (let i = 0; i < weights.length; i++) {
    roll -= Math.max(0, weights[i])
    if (roll < 0) return i
  }
  return weights.length - 1
}

export function newId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  return `${Date.now().toString(36)}-${Math.floor(random() * 1e9).toString(36)}`
}
