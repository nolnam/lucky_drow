import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { Prize } from '../types'

/** 8절 — 2~3초간 축포. */
function celebrate(): () => void {
  const end = Date.now() + 2400
  let frame = 0

  const shoot = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 68,
      origin: { x: 0, y: 0.7 },
      colors: ['#6366F1', '#EC4899', '#F97316', '#EAB308', '#22C55E'],
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 68,
      origin: { x: 1, y: 0.7 },
      colors: ['#8B5CF6', '#06B6D4', '#3B82F6', '#EAB308', '#EC4899'],
      disableForReducedMotion: true,
    })
    if (Date.now() < end) frame = requestAnimationFrame(shoot)
  }

  frame = requestAnimationFrame(shoot)
  return () => cancelAnimationFrame(frame)
}

type Props = {
  winner: Prize
  /** 이번 당첨으로 수량이 0이 되어 원판에서 빠졌는지 (11절) */
  soldOut: boolean
  canSpinAgain: boolean
  onSpinAgain: () => void
  onRemove: () => void
  onClose: () => void
  onReset: () => void
}

export function WinnerModal({
  winner,
  soldOut,
  canSpinAgain,
  onSpinAgain,
  onRemove,
  onClose,
  onReset,
}: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null)
  const isBlank = /^꽝/.test(winner.name)

  useEffect(() => {
    primaryRef.current?.focus()
    if (isBlank) return
    return celebrate()
  }, [isBlank])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <div className="animate-pop w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl">
        <p id="winner-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {isBlank ? '😅 아쉽네요!' : '🎉 축하합니다!'}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {isBlank ? '다음 기회에!' : '오늘의 경품'}
        </p>

        <div
          className="mx-auto mt-6 rounded-2xl px-6 py-8"
          style={{ backgroundColor: `${winner.color}1A`, border: `2px solid ${winner.color}` }}
        >
          <div className="text-7xl leading-none sm:text-8xl" aria-hidden="true">
            {winner.emoji}
          </div>
          <p className="mt-4 text-3xl font-extrabold break-keep text-slate-900 sm:text-4xl">
            {winner.name}
          </p>
          {/* 색이 아니라 글자로도 결과를 알 수 있어야 한다 (32절) */}
          <p className="mt-2 text-lg font-bold" style={{ color: winner.color }}>
            {isBlank ? '꽝' : '당첨!'}
          </p>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {soldOut
            ? '남은 수량이 모두 소진되어 원판에서 제외되었습니다.'
            : `남은 수량 ${winner.quantity}개`}
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button
            ref={primaryRef}
            type="button"
            onClick={onSpinAgain}
            disabled={!canSpinAgain}
            className="min-h-[44px] flex-1 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            🎯 다시 돌리기
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={soldOut}
            className="min-h-[44px] flex-1 rounded-xl border-2 border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            당첨 경품 제거
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-2 font-semibold text-slate-500 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] px-2 font-semibold text-slate-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            처음부터 다시하기
          </button>
        </div>
      </div>
    </div>
  )
}
