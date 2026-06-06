'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  return (
    <html lang="mn">
      <body style={{ background: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Алдаа гарлаа</h2>
          <button
            onClick={() => typeof reset === 'function' ? reset() : window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Дахин оролдох
          </button>
        </div>
      </body>
    </html>
  )
}
