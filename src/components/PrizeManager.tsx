import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import type { Prize } from '../types'
import { PrizeForm, type PrizeDraft } from './PrizeForm'
import { PrizeList } from './PrizeList'
import { PrizeRecommendation } from './PrizeRecommendation'

type Props = {
  prizes: Prize[]
  useWeights: boolean
  disabled: boolean
  onAdd: (drafts: PrizeDraft[]) => void
  onUpdate: (id: string, patch: Partial<Prize>) => void
  onRemove: (id: string) => void
}

export function PrizeManager({ prizes, useWeights, disabled, onAdd, onUpdate, onRemove }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [recoOpen, setRecoOpen] = useState(false)

  const total = prizes.reduce((sum, p) => sum + p.quantity, 0)
  const weightTotal = prizes
    .filter((p) => p.quantity > 0)
    .reduce((sum, p) => sum + (p.weight ?? 0), 0)

  return (
    <section aria-labelledby="manager-title">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 id="manager-title" className="text-sm font-extrabold text-slate-700">
          🎁 경품 관리
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          {prizes.length}종 · 총 {total}개
        </p>
      </div>

      <PrizeList
        prizes={prizes}
        useWeights={useWeights}
        weightTotal={weightTotal}
        disabled={disabled}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-indigo-300 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus size={16} aria-hidden="true" /> 경품 추가
        </button>
        <button
          type="button"
          onClick={() => setRecoOpen(true)}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-violet-100 px-4 text-sm font-bold text-violet-700 transition hover:bg-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Sparkles size={15} aria-hidden="true" /> 추천
        </button>
      </div>

      {formOpen && (
        <div className="mt-2">
          <PrizeForm onAdd={(draft) => onAdd([draft])} onCancel={() => setFormOpen(false)} />
        </div>
      )}

      {recoOpen && (
        <PrizeRecommendation
          onAdd={(seeds) => onAdd(seeds.map((s) => ({ ...s, quantity: 1 })))}
          onClose={() => setRecoOpen(false)}
        />
      )}
    </section>
  )
}
