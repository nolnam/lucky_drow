import { Download } from 'lucide-react'
import type { HistoryEntry } from '../types'

function toCsv(history: HistoryEntry[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = history.map((h, i) =>
    [String(history.length - i), escape(h.emoji), escape(h.prizeName), escape(h.at)].join(','),
  )
  // 엑셀이 UTF-8로 열도록 BOM을 붙인다
  return `﻿순번,아이콘,경품명,당첨시각\n${rows.join('\n')}\n`
}

type Props = {
  history: HistoryEntry[]
  onClear: () => void
}

/** 28절 — 최근 당첨 기록. CSV 내려받기 포함. */
export function WinnerHistory({ history, onClear }: Props) {
  const download = () => {
    const blob = new Blob([toCsv(history)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lucky-draw-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-labelledby="history-title">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="history-title" className="text-sm font-extrabold text-slate-700">
          🏆 최근 당첨 <span className="text-slate-400">({history.length})</span>
        </h2>
        {history.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={download}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Download size={13} aria-hidden="true" /> CSV
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              기록 비우기
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
          아직 추첨 기록이 없습니다.
        </p>
      ) : (
        <ol className="flex max-h-52 flex-col gap-1 overflow-y-auto pr-1">
          {history.map((entry, i) => (
            <li
              key={entry.id}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm"
            >
              <span className="w-5 shrink-0 text-right text-xs font-bold text-slate-400">
                {history.length - i}
              </span>
              <span aria-hidden="true">{entry.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">
                {entry.prizeName}
              </span>
              <time
                dateTime={entry.at}
                className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums"
              >
                {new Date(entry.at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
