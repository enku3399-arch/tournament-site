import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚖️</span>
            <div className="leading-none">
              <span className="block text-sm font-extrabold text-foreground">Шүүгчийн портал</span>
              <span className="block text-[10px] text-muted">Монгол 87/89 · V Наадам</span>
            </div>
          </div>
          <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors border border-border rounded px-3 py-1.5">
            ← Нийтийн сайт
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </>
  )
}
