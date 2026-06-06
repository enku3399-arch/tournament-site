import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl">🏆</span>
          <div className="leading-none">
            <span className="block text-sm font-extrabold text-accent tracking-wide">87/89 ТББ</span>
            <span className="block text-[10px] text-muted">V Спорт Наадам · 2026</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors hidden sm:block">
            Нүүр
          </Link>
          <Link href="/judge" className="rounded px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors flex items-center gap-1">
            <span>⚖️</span>
            <span className="hidden sm:inline">Шүүгч</span>
          </Link>
          <Link href="/admin" className="ml-1 rounded bg-primary px-3 py-1.5 text-white hover:bg-primary-hover transition-colors font-semibold">
            Админ
          </Link>
        </nav>
      </div>
    </header>
  )
}
