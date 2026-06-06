'use client'
import { useState, useEffect } from 'react'

// 2026-06-11 13:00 Ulaanbaatar time (UTC+8)
const TARGET = new Date('2026-06-11T13:00:00+08:00').getTime()

function pad(n: number) { return String(n).padStart(2, '0') }

function calc() {
  const diff = TARGET - Date.now()
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

const PLACEHOLDER = [
  { num: '--', label: 'Хоног' },
  { num: '--', label: 'Цаг'   },
  { num: '--', label: 'Минут' },
  { num: '--', label: 'Сек'   },
]

export default function Countdown() {
  // Start with null — server and client both render '--', no mismatch
  const [t, setT] = useState<ReturnType<typeof calc> | null>(null)

  useEffect(() => {
    setT(calc())
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const cells = t === null
    ? PLACEHOLDER
    : t.done
      ? [{ num: '00', label: 'Хоног' }, { num: '00', label: 'Цаг' }, { num: '00', label: 'Минут' }, { num: '00', label: 'Сек' }]
      : [
          { num: String(t.d), label: 'Хоног' },
          { num: pad(t.h),    label: 'Цаг'   },
          { num: pad(t.m),    label: 'Минут' },
          { num: pad(t.s),    label: 'Сек'   },
        ]

  return (
    <div className="countdown-grid">
      {cells.map(({ num, label }) => (
        <div key={label} className="cd-cell">
          <div className="cd-num">{num}</div>
          <div className="cd-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
