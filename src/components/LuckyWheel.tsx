import { useEffect, useRef } from 'react'
import type { Segment, SpinPlan } from '../lib/wheel'
import { easeOut, segmentAtPointer } from '../lib/wheel'
import { readableTextColor } from '../lib/color'

const SIZE = 400
const C = SIZE / 2
const R = 188

/** 12시에서 시계방향으로 잰 각도를 SVG 좌표로. */
function point(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: C + radius * Math.cos(rad), y: C + radius * Math.sin(rad) }
}

function segmentPath(start: number, sweep: number): string {
  const a = point(start, R)
  const b = point(start + sweep, R)
  const largeArc = sweep > 180 ? 1 : 0
  return `M ${C} ${C} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`
}

function truncate(name: string, sweep: number): string {
  const max = Math.max(5, Math.round(sweep / 2.4))
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

type Props = {
  segments: Segment[]
  /** null이면 정지 상태. 값이 들어오면 그 계획대로 한 번 회전한다. */
  plan: SpinPlan | null
  rotation: number
  onTick: () => void
  onSettle: (plan: SpinPlan) => void
}

export function LuckyWheel({ segments, plan, rotation, onTick, onSettle }: Props) {
  const groupRef = useRef<SVGGElement>(null)

  // 콜백은 ref로 잡아둔다 — 부모가 새 함수를 넘겨도 회전이 다시 시작되지 않는다.
  const onTickRef = useRef(onTick)
  const onSettleRef = useRef(onSettle)
  onTickRef.current = onTick
  onSettleRef.current = onSettle

  const segmentsRef = useRef(segments)
  segmentsRef.current = segments

  useEffect(() => {
    if (!plan) return

    const from = rotation
    const distance = plan.targetRotation - from
    const startedAt = performance.now()
    let frame = 0
    let lastIndex = segmentAtPointer(segmentsRef.current, from)
    let lastTickAt = 0

    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / plan.durationMs)
      const current = from + distance * easeOut(t)

      groupRef.current?.setAttribute('transform', `rotate(${current} ${C} ${C})`)

      // 칸이 포인터를 지나갈 때마다 tick. 초반에는 프레임마다 여러 칸을 건너뛰므로
      // 인덱스 변화만 보고, 소리가 뭉치지 않게 최소 간격을 둔다. (9절)
      const index = segmentAtPointer(segmentsRef.current, current)
      if (index !== lastIndex) {
        lastIndex = index
        if (now - lastTickAt > 45) {
          lastTickAt = now
          onTickRef.current()
        }
      }

      if (t < 1) {
        frame = requestAnimationFrame(step)
      } else {
        onSettleRef.current(plan)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // rotation은 회전 시작 시점의 값만 쓰면 되므로 의존성에 넣지 않는다.
  }, [plan])

  const isSingle = segments.length === 1

  return (
    <div className="relative aspect-square w-full">
      {/* 18절 — 원판 상단에 고정된 포인터. 회전하는 그룹 바깥에 있다. */}
      <div className="pointer-events-none absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
        <svg width="42" height="46" viewBox="0 0 42 46" aria-hidden="true">
          <path
            d="M21 44 L4 8 A 19 19 0 0 1 38 8 Z"
            fill="#EF4444"
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full drop-shadow-[0_18px_40px_rgba(79,70,229,0.28)]"
        role="img"
        aria-label={
          segments.length === 0
            ? '경품이 없는 빈 원판'
            : `경품 원판. ${segments.map((s) => s.prize.name).join(', ')}`
        }
      >
        <circle cx={C} cy={C} r={R + 10} fill="#fff" />
        <circle cx={C} cy={C} r={R + 6} fill="none" stroke="#E2E8F0" strokeWidth="3" />

        <g ref={groupRef} transform={`rotate(${rotation} ${C} ${C})`}>
          {segments.map((s) => {
            const mid = s.start + s.sweep / 2
            const textColor = readableTextColor(s.prize.color)
            const fontSize = Math.min(21, Math.max(9, s.sweep * 0.5))

            return (
              <g key={s.prize.id}>
                {isSingle ? (
                  <circle cx={C} cy={C} r={R} fill={s.prize.color} />
                ) : (
                  <path
                    d={segmentPath(s.start, s.sweep)}
                    fill={s.prize.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}
                {/* 글자는 중심에서 바깥으로 뻗는다 — 칸이 좁아져도 읽힌다. */}
                <g transform={`rotate(${mid - 90} ${C} ${C})`}>
                  <text
                    x={C + R * 0.82}
                    y={C}
                    fontSize={fontSize * 1.25}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {s.prize.emoji}
                  </text>
                  <text
                    x={C + R * 0.68}
                    y={C}
                    fill={textColor}
                    fontSize={fontSize}
                    fontWeight="700"
                    textAnchor="end"
                    dominantBaseline="central"
                  >
                    {truncate(s.prize.name, s.sweep)}
                  </text>
                </g>
              </g>
            )
          })}

          {segments.length === 0 && (
            <>
              <circle cx={C} cy={C} r={R} fill="#F1F5F9" />
              <text
                x={C}
                y={C}
                fill="#94A3B8"
                fontSize="20"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                경품을 추가해 주세요
              </text>
            </>
          )}
        </g>

        {/* 중앙 허브 — 회전하지 않는다 */}
        <circle cx={C} cy={C} r="42" fill="#fff" stroke="#E2E8F0" strokeWidth="3" />
        <text x={C} y={C} fontSize="34" textAnchor="middle" dominantBaseline="central">
          🎯
        </text>
      </svg>
    </div>
  )
}
