import { Maximize, Minimize, Monitor, Volume2, VolumeX } from 'lucide-react'

type Props = {
  sound: boolean
  onToggleSound: () => void
  presenter: boolean
  onTogglePresenter: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function Header({
  sound,
  onToggleSound,
  presenter,
  onTogglePresenter,
  isFullscreen,
  onToggleFullscreen,
}: Props) {
  const iconButton =
    'flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          🎁 Lucky Draw
        </h1>
        <p className="truncate text-sm font-medium text-slate-500">오늘의 행운을 뽑아보세요!</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={sound}
          className={iconButton}
          title={sound ? '사운드 끄기' : '사운드 켜기'}
        >
          {sound ? (
            <Volume2 size={17} aria-hidden="true" />
          ) : (
            <VolumeX size={17} aria-hidden="true" />
          )}
          <span className="sr-only">{sound ? '사운드 켜짐' : '사운드 꺼짐'}</span>
        </button>

        <button
          type="button"
          onClick={onTogglePresenter}
          aria-pressed={presenter}
          className={`${iconButton} ${presenter ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}
          title="발표용 모드 — 설정 패널을 숨깁니다"
        >
          <Monitor size={17} aria-hidden="true" />
          <span className="hidden sm:inline">발표용</span>
          <span className="sr-only">{presenter ? '발표용 모드 켜짐' : '발표용 모드 꺼짐'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className={iconButton}
          title="전체화면 (F)"
        >
          {isFullscreen ? (
            <Minimize size={17} aria-hidden="true" />
          ) : (
            <Maximize size={17} aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? '해제' : '전체화면'}</span>
        </button>
      </div>
    </header>
  )
}
