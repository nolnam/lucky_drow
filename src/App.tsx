import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HistoryEntry, Prize, Settings as SettingsType } from './types'
import type { Segment, SpinPlan } from './lib/wheel'
import { buildSegments, planSpin, spinnablePrizes } from './lib/wheel'
import { EMPTY_STATE, clear as clearStorage, load, save } from './lib/storage'
import { SAMPLE_SEEDS, makePrizes } from './lib/catalog'
import { newId } from './lib/random'
import { playTick, playWin, primeAudio } from './lib/sound'
import { useFullscreen } from './hooks/useFullscreen'
import { Header } from './components/Header'
import { LuckyWheel } from './components/LuckyWheel'
import { SpinButton } from './components/SpinButton'
import { PrizeManager } from './components/PrizeManager'
import type { PrizeDraft } from './components/PrizeForm'
import { WinnerModal } from './components/WinnerModal'
import { WinnerHistory } from './components/WinnerHistory'
import { Settings } from './components/Settings'
import { StartScreen } from './components/StartScreen'

const HISTORY_LIMIT = 100

/** 단축키를 삼키면 안 되는 곳 — 입력 중이거나 버튼에 포커스가 있을 때. (25절) */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
}

export default function App() {
  const initial = useMemo(load, [])
  const [prizes, setPrizes] = useState<Prize[]>(initial.prizes)
  const [history, setHistory] = useState<HistoryEntry[]>(initial.history)
  const [settings, setSettings] = useState<SettingsType>(initial.settings)

  const [rotation, setRotation] = useState(0)
  const [plan, setPlan] = useState<SpinPlan | null>(null)
  const [winner, setWinner] = useState<Prize | null>(null)
  const [winnerSoldOut, setWinnerSoldOut] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const [presenter, setPresenter] = useState(false)
  const [dismissedStart, setDismissedStart] = useState(initial.prizes.length > 0)

  const { isFullscreen, exit: exitFullscreen, toggle: toggleFullscreen } = useFullscreen()

  /** 회전 중에는 목록이 잠기지만, 계획 당시의 칸 배열을 그대로 들고 있어야 안전하다. */
  const spinSegmentsRef = useRef<Segment[]>([])

  const spinning = plan !== null
  const segments = useMemo(() => buildSegments(prizes, settings), [prizes, settings])
  const canSpin = segments.length > 0 && !spinning

  useEffect(() => {
    save({ prizes, history, settings })
  }, [prizes, history, settings])

  // 발표용 모드는 전체화면과 함께 켜진다 — 행사장에서는 원판만 크게 보여야 한다. (23·24절)
  useEffect(() => {
    if (isFullscreen) setPresenter(true)
  }, [isFullscreen])

  const handleTick = useCallback(() => {
    if (settings.sound) playTick()
  }, [settings.sound])

  const spin = useCallback(() => {
    if (spinning) return
    const current = buildSegments(prizes, settings)
    if (current.length === 0) return

    if (settings.sound) primeAudio()
    spinSegmentsRef.current = current

    const next = planSpin(current, rotation)
    if (!next) return

    setWinner(null)
    setAnnouncement('원판을 돌리는 중입니다.')
    setPlan(next)
  }, [prizes, rotation, settings, spinning])

  const handleSettle = useCallback(
    (settled: SpinPlan) => {
      const segment = spinSegmentsRef.current[settled.winnerIndex]
      setRotation(((settled.targetRotation % 360) + 360) % 360)
      setPlan(null)
      if (!segment) return

      const won = segment.prize
      // 수량 차감은 켜져 있을 때만. 끄면 같은 경품이 계속 나올 수 있다. (11·29절)
      const remaining = settings.removeWinner ? Math.max(0, won.quantity - 1) : won.quantity

      if (settings.removeWinner) {
        setPrizes((prev) =>
          prev.map((p) => (p.id === won.id ? { ...p, quantity: remaining } : p)),
        )
      }

      setHistory((prev) =>
        [
          {
            id: newId(),
            prizeName: won.name,
            emoji: won.emoji,
            color: won.color,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, HISTORY_LIMIT),
      )

      setWinnerSoldOut(remaining === 0)
      setWinner({ ...won, quantity: remaining })
      setAnnouncement(`당첨: ${won.name}. 남은 수량 ${remaining}개.`)
      if (settings.sound) playWin()
    },
    [settings.removeWinner, settings.sound],
  )

  const closeWinner = useCallback(() => setWinner(null), [])

  const spinAgain = useCallback(() => {
    setWinner(null)
    spin()
  }, [spin])

  const removeWinnerPrize = useCallback(() => {
    if (!winner) return
    setPrizes((prev) => prev.filter((p) => p.id !== winner.id))
    setAnnouncement(`${winner.name}을(를) 원판에서 제거했습니다.`)
    setWinner(null)
  }, [winner])

  const addPrizes = useCallback((drafts: PrizeDraft[]) => {
    setPrizes((prev) => {
      const made = makePrizes(
        drafts.map((d) => ({ name: d.name, emoji: d.emoji, quantity: d.quantity })),
        prev,
      )
      // 폼에서 색을 직접 고른 건은 자동 배정 대신 그 색을 쓴다.
      const withChosenColors = made.map((p, i) =>
        drafts[i].color ? { ...p, color: drafts[i].color! } : p,
      )
      return [...prev, ...withChosenColors]
    })
  }, [])

  const updatePrize = useCallback((id: string, patch: Partial<Prize>) => {
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const removePrize = useCallback((id: string) => {
    setPrizes((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const loadSample = useCallback(() => {
    setPrizes((prev) => [...prev, ...makePrizes(SAMPLE_SEEDS, prev)])
    setDismissedStart(true)
  }, [])

  const changeSettings = useCallback((patch: Partial<SettingsType>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    if (patch.sound) primeAudio()

    // 확률을 처음 켜면 균등하게 채워 둔다 — 빈 칸부터 시작하면 원판이 사라진다.
    if (patch.useWeights) {
      setPrizes((prev) => {
        if (prev.some((p) => typeof p.weight === 'number' && p.weight > 0)) return prev
        const pool = spinnablePrizes(prev)
        if (pool.length === 0) return prev
        const even = Math.round((100 / pool.length) * 10) / 10
        return prev.map((p) => ({ ...p, weight: p.quantity > 0 ? even : 0 }))
      })
    }
  }, [])

  const resetAll = useCallback(() => {
    if (!window.confirm('모든 경품 설정을 초기화하시겠습니까?')) return
    clearStorage()
    setPrizes(EMPTY_STATE.prizes)
    setHistory(EMPTY_STATE.history)
    setSettings(EMPTY_STATE.settings)
    setWinner(null)
    setRotation(0)
    setDismissedStart(false)
    setAnnouncement('모든 설정을 초기화했습니다.')
  }, [])

  // 25절 — 키보드 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) exitFullscreen()
        else if (winner) closeWinner()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return

      if (e.code === 'Space') {
        e.preventDefault()
        if (winner) spinAgain()
        else spin()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        spinAgain()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeWinner, exitFullscreen, isFullscreen, spin, spinAgain, toggleFullscreen, winner])

  const showPanels = !presenter
  const showStart = !dismissedStart && prizes.length === 0

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50">
      {/* 상태 변화는 텍스트로도 전달한다 (32절) */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-5 px-3 py-4 sm:px-5 sm:py-6">
        <Header
          sound={settings.sound}
          onToggleSound={() => changeSettings({ sound: !settings.sound })}
          presenter={presenter}
          onTogglePresenter={() => setPresenter((v) => !v)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <main
          className={`grid flex-1 items-start gap-6 ${
            showPanels ? 'lg:grid-cols-[minmax(300px,30%)_1fr]' : 'lg:grid-cols-1'
          }`}
        >
          {/* Wheel — 모바일·태블릿에서는 항상 위에 온다 (15절) */}
          <section className="order-1 flex flex-col items-center gap-5 lg:order-2">
            <div className="w-full max-w-[min(90vw,560px)]">
              <LuckyWheel
                segments={segments}
                plan={plan}
                rotation={rotation}
                onTick={handleTick}
                onSettle={handleSettle}
              />
            </div>

            <SpinButton spinning={spinning} disabled={!canSpin} onSpin={spin} />

            {segments.length === 0 && prizes.length > 0 && (
              <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                남은 수량이 있는 경품이 없습니다. 수량을 올리거나 경품을 추가하세요.
              </p>
            )}
          </section>

          {showPanels && (
            <aside className="order-2 flex flex-col gap-5 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 lg:order-1 lg:sticky lg:top-6">
              <PrizeManager
                prizes={prizes}
                useWeights={settings.useWeights}
                disabled={spinning}
                onAdd={addPrizes}
                onUpdate={updatePrize}
                onRemove={removePrize}
              />
              <hr className="border-slate-100" />
              <WinnerHistory history={history} onClear={() => setHistory([])} />
              <hr className="border-slate-100" />
              <Settings settings={settings} onChange={changeSettings} onReset={resetAll} />
            </aside>
          )}
        </main>
      </div>

      {showStart && (
        <StartScreen onSample={loadSample} onManual={() => setDismissedStart(true)} />
      )}

      {winner && (
        <WinnerModal
          winner={winner}
          soldOut={winnerSoldOut}
          canSpinAgain={segments.length > 0}
          onSpinAgain={spinAgain}
          onRemove={removeWinnerPrize}
          onClose={closeWinner}
          onReset={resetAll}
        />
      )}
    </div>
  )
}
