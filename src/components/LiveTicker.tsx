'use client'

import { useState, useEffect } from 'react'

type TickerItem = {
  id: string
  icon: string
  team1: string
  team2: string
  score1: number
  score2: number
  win1: boolean
  win2: boolean
}

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/live-results', { cache: 'no-store' })
        if (r.ok) setItems(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (items.length === 0) return null

  // Duplicate for seamless loop
  const track = [...items, ...items]
  const duration = Math.max(20, items.length * 5)

  return (
    <div className="live-ticker-wrap">
      <div
        className="live-ticker-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((item, i) => (
          <span key={`${item.id}-${i}`} className="live-ticker-item">
            <span className="live-ticker-icon">{item.icon}</span>
            <span className={item.win1 ? 'live-ticker-winner' : ''}>{item.team1}</span>
            <span className="live-ticker-score">
              {item.score1}:{item.score2}
            </span>
            <span className={item.win2 ? 'live-ticker-winner' : ''}>{item.team2}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
