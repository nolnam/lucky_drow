/** #RRGGBB → 상대 휘도. 세그먼트 위 글자색을 정하는 데 쓴다. (32절 대비) */
function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 0
  const int = parseInt(m[1], 16)
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** 노란 계열 위에서는 흰 글씨가 읽히지 않는다 — 배경 밝기를 보고 고른다. */
export function readableTextColor(background: string): string {
  return luminance(background) > 0.42 ? '#1E293B' : '#FFFFFF'
}
