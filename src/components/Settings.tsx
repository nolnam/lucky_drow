import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { Settings as SettingsType } from '../types'

type ToggleProps = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
}

function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-indigo-600"
      />
      <span className="flex-1">
        <span className="block text-sm font-semibold text-slate-700">{label}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
    </label>
  )
}

type Props = {
  settings: SettingsType
  onChange: (patch: Partial<SettingsType>) => void
  onReset: () => void
}

export function Settings({ settings, onChange, onReset }: Props) {
  return (
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" className="mb-2 text-sm font-extrabold text-slate-700">
        ⚙️ 설정
      </h2>

      <div className="flex flex-col">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => onChange({ sound: e.target.checked })}
            className="h-5 w-5 shrink-0 accent-indigo-600"
          />
          <span className="flex flex-1 items-center gap-1.5 text-sm font-semibold text-slate-700">
            {settings.sound ? (
              <Volume2 size={15} aria-hidden="true" />
            ) : (
              <VolumeX size={15} aria-hidden="true" />
            )}
            사운드
          </span>
        </label>

        <Toggle
          checked={settings.removeWinner}
          onChange={(removeWinner) => onChange({ removeWinner })}
          label="당첨 시 수량 차감"
          hint="수량이 0이 되면 원판에서 자동 제거됩니다."
        />

        <Toggle
          checked={settings.useWeights}
          onChange={(useWeights) => onChange({ useWeights })}
          label="경품별 확률 설정"
          hint="끄면 모든 경품이 같은 확률입니다."
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <RotateCcw size={15} aria-hidden="true" /> 초기화
      </button>
    </section>
  )
}
