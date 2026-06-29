import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: '編み図PDF翻訳 | 英語の編み図を日本語に｜海外ニットパターン対応',
  description: '海外の英語編み図PDFを日本語に翻訳。k2tog・yo・ssk・cast onなど編み物専門用語に対応。Ravelryの英語パターンも日本語でらくらく読める無料翻訳サービス。日本語の編み図を英語に翻訳することも可能。',
  keywords: '編み図翻訳, 英語編み図, ニットパターン翻訳, Ravelry翻訳, 海外編み図, かぎ針編み翻訳, 棒針編み翻訳, PDF翻訳',
  openGraph: {
    title: '編み図PDF翻訳 | 英語↔日本語',
    description: '海外の英語編み図PDFを日本語に翻訳。編み物専門用語に対応した無料サービス。',
    url: 'https://knit-translator.vercel.app',
    siteName: '編み図PDF翻訳',
    locale: 'ja_JP',
    type: 'website',
  },
  other: {
    'google-adsense-account': 'ca-pub-7170961537823994',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7170961537823994"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}