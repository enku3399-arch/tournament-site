import './globals.css'

export const metadata = {
  title: 'Монгол 87/89 · V Спорт Наадам · УБ 2026',
  description: 'Монгол 87/89 Төгсөгчдийн Холбоо ТББ-ийн V Спорт Наадам 2026 — Улаанбаатар, "Буянт Ухаа" спорт ордон',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
