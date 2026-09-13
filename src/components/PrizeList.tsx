import { Trash2 } from 'lucide-react'
import type { Prize } from '../types'
import { PALETTE } from '../lib/catalog'

type Props = {
  prizes: Prize[]
  useWeights: boolean
  weightTotal: number
  disabled: boolean
  onUpdate: (id: string, patch: Partial<Prize>) => void
  onRemove: (id: string) => void
}

export function PrizeList({
  prizes,
  useWeights,
  weightTotal,
  disabled,
  onUpdate,
  onRemove,
}: Props) {
  if (prizes.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        아직 등록된 경품이 없습니다.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {prizes.map((prize) => {
        const soldOut = prize.quantity <= 0
        return (
          <li
            key={prize.id}
            className={`flex items-center gap-2 rounded-xl border-2 bg-white px-2.5 py-2 transition ${
              soldOut ? 'border-slate-100 opacity-55' : 'border-slate-200'
            }`}
          >
            <span
              className="h-9 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: prize.color }}
              aria-hidden="true"
            />
            <span className="shrink-0 text-xl" aria-hidden="true">
              {prize.emoji}
            </span>

            <label className="sr-only" htmlFor={`name-${prize.id}`}>
              경품 이름
            </label>
            <input
              id={`name-${prize.id}`}
              value={prize.name}
              maxLength={40}
              disabled={disabled}
              onChange={(e) => onUpdate(prize.id, { name: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1.5 text-sm font-semibold text-slate-800 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none disabled:text-slate-400"
            />

            {useWeights && (
              <span className="flex shrink-0 items-center gap-0.5">
                <label className="sr-only" htmlFor={`weight-${prize.id}`}>
                  {prize.name} 확률
                </label>
                <input
                  id={`weight-${prize.id}`}
                  type="number"
                  min={0}
                  max={100}
                  disabled={disabled}
                  value={prize.weight ?? 0}
                  onChange={(e) => onUpdate(prize.id, { weight: Math.max(0, Number(e.target.value)) })}
                  className="w-14 rounded-lg border border-slate-200 px-1 py-1.5 text-center text-sm font-semibold text-indigo-700 focus:border-indigo-400 focus:outline-none"
                />
                <span className="text-xs font-semibold text-slate-400">%</span>
              </span>
            )}

            <label className="sr-only" htmlFor={`qty-${prize.id}`}>
              {prize.name} 수량
            </label>
            <input
              id={`qty-${prize.id}`}
              type="number"
              min={0}
              max={999}
              disabled={disabled}
              value={prize.quantity}
              onChange={(e) => onUpdate(prize.id, { quantity: Math.max(0, Number(e.target.value)) })}
              className="w-14 shrink-0 rounded-lg border border-slate-200 px-1 py-1.5 text-center text-sm font-bold text-slate-700 focus:border-indigo-400 focus:outline-none"
            />

            <label className="sr-only" htmlFor={`color-${prize.id}`}>
              {prize.name} 색상
            </label>
            <select
              id={`color-${prize.id}`}
              value={prize.color}
              disabled={disabled}
              onChange={(e) => onUpdate(prize.id, { color: e.target.value })}
              style={{ backgroundColor: prize.color }}
              className="h-8 w-8 shrink-0 cursor-pointer appearance-none rounded-lg text-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {PALETTE.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-800">
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onRemove(prize.id)}
              disabled={disabled}
              aria-label={`${prize.name} 삭제`}
              className="shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </li>
        )
      })}

      {useWeights && (
        <li
          className={`rounded-xl px-3 py-2 text-xs font-bold ${
            Math.round(weightTotal) === 100
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          확률 합계 {Math.round(weightTotal * 10) / 10}%
          {Math.round(weightTotal) === 100
            ? ' — 정상'
            : ' — 100%가 아니면 입력한 비율대로 다시 정규화해서 사용합니다.'}
        </li>
      )}
    </ul>
  )
}
