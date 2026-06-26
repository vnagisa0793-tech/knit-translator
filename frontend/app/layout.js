import './globals.css'

export const metadata = {
  title: '編み図PDF翻訳 | 英語↔日本語',
  description: '編み図PDFを英語から日本語、または日本語から英語に翻訳します。k2tog・yo・ssk など専門用語に対応。',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
