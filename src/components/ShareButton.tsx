'use client'

import { useState } from 'react'

interface ShareButtonProps {
  url?: string
  title?: string
  label?: string
}

export default function ShareButton({ url, title = '', label }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')

  function shareToFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank', 'width=600,height=400,noopener'
    )
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {label && <span style={{ fontSize: 11, color: 'var(--fog)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>}
      <button
        onClick={shareToFacebook}
        title="Facebook-т share хийх"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 6,
          background: '#1877F2', color: '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700,
          transition: 'opacity .15s',
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = '.85')}
        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>
      <button
        onClick={copyLink}
        title="Линк хуулах"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 6,
          background: copied ? 'rgba(22,163,74,.15)' : 'var(--ink-2)',
          color: copied ? '#16a34a' : 'var(--fog)',
          border: '1px solid',
          borderColor: copied ? 'rgba(22,163,74,.4)' : 'var(--line)',
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
          transition: 'all .15s',
        }}
      >
        {copied ? '✓ Хуулагдлаа' : '🔗 Линк хуулах'}
      </button>
    </div>
  )
}
