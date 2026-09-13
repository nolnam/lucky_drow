type Props = {
  onSample: () => void
  onManual: () => void
}

/** 22절 — 첫 접속 화면. 두 갈래 CTA로 30초 안에 첫 추첨까지 밀어준다. (42절) */
export function StartScreen({ onSample, onManual }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="animate-pop w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <p className="text-5xl" aria-hidden="true">
          🎁
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-900">Lucky Draw</h2>
        <p className="mt-2 text-base font-medium break-keep text-slate-500">
          경품을 등록하고
          <br />
          오늘의 행운을 뽑아보세요!
        </p>

        <div className="mt-7 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSample}
            className="min-h-[52px] rounded-xl bg-indigo-600 text-base font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            샘플 경품으로 시작
          </button>
          <button
            type="button"
            onClick={onManual}
            className="min-h-[52px] rounded-xl border-2 border-slate-200 text-base font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            경품 직접 입력
          </button>
        </div>
      </div>
    </div>
  )
}
