import { useEffect, useRef, useState } from 'react'
import { RECOMMENDATIONS } from '../lib/catalog'

type Props = {
  onAdd: (seeds: { name: string; emoji: string }[]) => void
  onClose: () => void
}

/** 20절 — 카테고리별 경품 추천. 여러 건을 골라 한 번에 담는다. */
export function PrizeRecommendation({ onAdd, onClose }: Props) {
  const [categoryId, setCategoryId] = useState(RECOMMENDATIONS[0].id)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const closeRef = useRef<HTMLButtonElement>(null)

  const category = RECOMMENDATIONS.find((c) => c.id === categoryId) ?? RECOMMENDATIONS[0]

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const toggle = (name: string) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const confirm = () => {
    const seeds = category.items.filter((i) => picked.has(i.name))
    if (seeds.length > 0) onAdd(seeds)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reco-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="reco-title" className="text-lg font-extrabold text-slate-900">
            ✨ 경품 추천
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="추천 닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto px-5 py-3" role="tablist">
          {RECOMMENDATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === categoryId}
              onClick={() => setCategoryId(c.id)}
              className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-bold transition ${
                c.id === categoryId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-5 pb-4">
          {category.items.map((item) => {
            const on = picked.has(item.name)
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => toggle(item.name)}
                aria-pressed={on}
                className={`flex min-h-[52px] items-center gap-2 rounded-xl border-2 px-3 text-left text-sm font-semibold transition ${
                  on
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="flex-1 break-keep">{item.name}</span>
                {/* 선택 여부를 색만이 아니라 체크 표시로도 알린다 (32절) */}
                <span aria-hidden="true" className={on ? 'text-indigo-600' : 'text-transparent'}>
                  ✓
                </span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={confirm}
            disabled={picked.size === 0}
            className="min-h-[48px] w-full rounded-xl bg-indigo-600 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {picked.size > 0 ? `${picked.size}개 담기` : '경품을 선택하세요'}
          </button>
        </div>
      </div>
    </div>
  )
}
