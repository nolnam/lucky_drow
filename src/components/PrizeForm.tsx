import { useEffect, useRef, useState } from 'react'
import { EMOJI_CHOICES, PALETTE } from '../lib/catalog'

export type PrizeDraft = { name: string; emoji: string; quantity: number; color?: string }

type Props = {
  onAdd: (draft: PrizeDraft) => void
  onCancel: () => void
}

/** 19절 — 경품 추가 폼. 이름·수량·이모지·색상. */
export function PrizeForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎁')
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState<string | undefined>(undefined)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => nameRef.current?.focus(), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      nameRef.current?.focus()
      return
    }
    onAdd({ name: trimmed, emoji, quantity: Math.max(1, quantity), color })
    // 연속 입력이 빠르도록 폼을 닫지 않고 비운다 (42절 — 30초 안에 첫 추첨)
    setName('')
    setQuantity(1)
    nameRef.current?.focus()
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 p-4"
      // 목록 전체가 Space 단축키를 먹지 않도록 폼 안에서는 전파를 막는다
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="prize-name">
          경품 이름
        </label>
        <input
          id="prize-name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="경품 이름"
          maxLength={40}
          className="min-h-[44px] min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-medium focus:border-indigo-400 focus:outline-none"
        />
        <label className="sr-only" htmlFor="prize-qty">
          수량
        </label>
        <input
          id="prize-qty"
          type="number"
          min={1}
          max={999}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="min-h-[44px] w-20 rounded-xl border-2 border-slate-200 bg-white px-3 text-center text-sm font-semibold focus:border-indigo-400 focus:outline-none"
        />
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1.5 text-xs font-bold text-slate-500">이모지</legend>
        <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setEmoji(choice)}
              aria-pressed={emoji === choice}
              aria-label={`이모지 ${choice}`}
              className={`h-9 w-9 rounded-lg text-lg transition ${
                emoji === choice
                  ? 'bg-indigo-600 ring-2 ring-indigo-300'
                  : 'bg-white hover:bg-slate-100'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-1.5 text-xs font-bold text-slate-500">색상</legend>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setColor(undefined)}
            aria-pressed={color === undefined}
            className={`min-h-[32px] rounded-lg px-2.5 text-xs font-semibold transition ${
              color === undefined
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            자동
          </button>
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={`색상 ${c}`}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-lg transition ${
                color === c ? 'ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-110'
              }`}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="min-h-[44px] flex-1 rounded-xl bg-indigo-600 px-4 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          추가
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-4 font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          닫기
        </button>
      </div>
    </form>
  )
}
