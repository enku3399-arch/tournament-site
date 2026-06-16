'use client'
import { useState, useEffect } from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }

function calc(target: number) {
  const diff = target - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true }
  const s = Math.floor(diff / 1000)
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: false,
  }
}

export default function Countdown({
  targetIso,
  dayLabel,
  hourLabel,
  minLabel,
  secLabel,
}: {
  targetIso: string
  dayLabel: string
  hourLabel: string
  minLabel: string
  secLabel: string
}) {
  const target = new Date(targetIso).getTime()

  const [t, setT] = useState<ReturnType<typeof calc> | null>(null)

  useEffect(() => {
    setT(calc(target))
    const id = setInterval(() => setT(calc(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const defaultLabels = [dayLabel, hourLabel, minLabel, secLabel]
  const cells = t === null
    ? defaultLabels.map(label => ({ num: '--', label }))
    : t.done
      ? defaultLabels.map(label => ({ num: '00', label }))
      : [
          { num: String(t.d), label: dayLabel },
          { num: pad(t.h), label: hourLabel },
          { num: pad(t.m), label: minLabel },
          { num: pad(t.s), label: secLabel },
        ]

  return (
    <div className="countdown-grid">
      {cells.map(({ num, label }, i) => (
        <div key={i} className="cd-cell">
          <div className="cd-num">{num}</div>
          <div className="cd-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
