type Props = {
  spinning: boolean
  disabled: boolean
  onSpin: () => void
}

export function SpinButton({ spinning, disabled, onSpin }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onSpin}
        disabled={disabled || spinning}
        className="min-h-[60px] w-full max-w-sm rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 px-8 text-xl font-extrabold text-white shadow-lg shadow-indigo-500/30 transition active:scale-[0.98] hover:from-indigo-600 hover:to-indigo-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
      >
        {spinning ? '돌리는 중…' : '🎯 돌리기'}
      </button>
      <p className="text-xs font-medium text-slate-400">
        Space 돌리기 · R 다시 · F 전체화면 · ESC 해제
      </p>
    </div>
  )
}
