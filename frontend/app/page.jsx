'use client'

import { useState } from 'react'

// =============================================
// 🎨 色・デザインのカスタマイズはここを変えてね！
// =============================================
const COLORS = {
  primary: '#e05585',        // メインのピンク色（ボタン・アクセント）
  primaryLight: '#fff0f4',   // 薄いピンク（背景・ホバー）
  primaryBorder: '#fcd5de',  // ボーダーのピンク
  primaryText: '#b83a6a',    // 濃いピンク（テキスト・ラベル）
  subText: '#c47a95',        // 薄いピンク（サブテキスト）
  hintText: '#d4a0b4',       // さらに薄い（ヒント文字）
  yarn1: '#e05585',          // 毛糸バーの色1
  yarn2: '#f4a0c0',          // 毛糸バーの色2
  yarn3: '#fcd5de',          // 毛糸バーの色3
}
// =============================================

export default function Home() {
  const [file, setFile] = useState(null)
  const [direction, setDirection] = useState('en_to_ja')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadName, setDownloadName] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setStatus('uploading')
    setErrorMsg('')
    setDownloadUrl('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('direction', direction)

      const res = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '翻訳に失敗しました')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const filename = res.headers.get('content-disposition')
        ?.match(/filename="?([^"]+)"?/)?.[1] || 'translated.pdf'

      setDownloadUrl(url)
      setDownloadName(filename)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <main style={{ background: '#fff8fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* ヘッダー */}
      <header style={{
        background: 'white',
        borderBottom: `1px solid ${COLORS.primaryBorder}`,
        padding: '14px 24px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧶</span>
          <div>
            {/* ↓ サービス名を変えたいときはここ */}
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.primaryText }}>編み図PDF翻訳</h1>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.subText }}>英語 ↔ 日本語 ｜ 編み物専門用語に対応</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* 広告スペース上 */}
        <div style={{
          background: '#fdf5f8',
          border: `1px dashed ${COLORS.primaryBorder}`,
          borderRadius: 12,
          padding: 12,
          textAlign: 'center',
          fontSize: 12,
          color: COLORS.hintText,
          marginBottom: 16,
        }}>
          広告スペース（Google AdSense）
        </div>

        {/* ヒーローカード */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #fff7f0 100%)`,
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 20,
          padding: '24px 24px 18px',
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 右の絵文字デコレーション */}
          <span style={{
            position: 'absolute', right: 20, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 56, opacity: 0.15,
          }}>🧶</span>

          {/* ↓ キャッチコピーを変えたいときはここ */}
          <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: COLORS.primaryText }}>
            編み図PDF翻訳
          </p>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.subText }}>
            かぎ編み・棒編みに対応！英語↔日本語の翻訳サービス
          </p>

          {/* 毛糸バー（色は上のCOLORSで変えられます） */}
          <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
            {[COLORS.yarn1, COLORS.yarn2, COLORS.yarn3, COLORS.yarn2, COLORS.yarn1, COLORS.yarn3, COLORS.yarn1].map((c, i) => (
              <div key={i} style={{ height: 4, borderRadius: 2, flex: 1, background: c }} />
            ))}
          </div>
        </div>

        {/* 使い方 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}>
          {[
            { num: '1', text: '翻訳の方向を選ぶ' },
            { num: '2', text: 'PDFをアップロード' },
            { num: '3', text: '翻訳してダウンロード' },
          ].map(({ num, text }) => (
            <div key={num} style={{
              background: 'white',
              border: `1px solid ${COLORS.primaryBorder}`,
              borderRadius: 14,
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 24, height: 24,
                background: COLORS.primary,
                color: 'white',
                borderRadius: '50%',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
              }}>{num}</div>
              <p style={{ fontSize: 11, color: COLORS.subText, margin: 0, lineHeight: 1.4 }}>{text}</p>
            </div>
          ))}
        </div>


        {/* 翻訳方向 */}
        <div style={{
          background: 'white',
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 18,
          padding: '18px 18px 16px',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryText, display: 'block', marginBottom: 10 }}>
            翻訳の方向
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { key: 'en_to_ja', label: '🇺🇸 英語 → 日本語 🇯🇵' },
              { key: 'ja_to_en', label: '🇯🇵 日本語 → 英語 🇺🇸' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDirection(key)}
                style={{
                  border: `2px solid ${direction === key ? COLORS.primary : COLORS.primaryBorder}`,
                  borderRadius: 14,
                  padding: '11px 8px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: direction === key ? COLORS.primaryLight : 'white',
                  color: direction === key ? COLORS.primaryText : COLORS.subText,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PDFアップロード */}
        <div style={{
          background: 'white',
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 18,
          padding: '18px 18px 16px',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryText, display: 'block', marginBottom: 10 }}>
            編み図PDF
          </span>
          <div
            onClick={() => document.getElementById('file-input').click()}
            style={{
              border: `2px dashed ${file ? COLORS.primary : COLORS.primaryBorder}`,
              borderRadius: 14,
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? COLORS.primaryLight : '#fff8fa',
              transition: 'all 0.15s',
            }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <>
                <p style={{ fontSize: 28, margin: '0 0 6px' }}>📄</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryText, margin: '0 0 4px' }}>{file.name}</p>
                <p style={{ fontSize: 11, color: COLORS.hintText, margin: 0 }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>📂</p>
                <p style={{ fontSize: 13, color: COLORS.subText, margin: '0 0 4px' }}>クリックしてPDFを選択</p>
                <p style={{ fontSize: 11, color: COLORS.hintText, margin: 0 }}>最大20MB</p>
              </>
            )}
          </div>
        </div>

        {/* 翻訳ボタン */}
        <div style={{
          background: 'white',
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
        }}>
          <button
            onClick={handleSubmit}
            disabled={!file || status === 'uploading'}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: 14,
              background: !file || status === 'uploading'
                ? '#e0c8d0'
                : `linear-gradient(135deg, ${COLORS.primary} 0%, #c03870 100%)`,
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: !file || status === 'uploading' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
          >
            {status === 'uploading' ? '翻訳中... 5分ほどかかる場合があります ⏳' : '🧶 翻訳する'}
          </button>
        </div>

        {/* エラー */}
        {status === 'error' && (
          <div style={{
            background: '#fff0f0',
            border: '1px solid #ffc0c0',
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: 13,
            color: '#c03030',
            marginBottom: 12,
          }}>
            ❌ {errorMsg}
          </div>
        )}

        {/* 完了・ダウンロード */}
        {status === 'done' && downloadUrl && (
          <div style={{
            background: '#f0fff4',
            border: '1px solid #a8e6c0',
            borderRadius: 18,
            padding: '20px 16px',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}>✅</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2d7a4f', margin: '0 0 14px' }}>翻訳が完了しました！</p>
            <a
              href={downloadUrl}
              download={downloadName}
              style={{
                display: 'inline-block',
                background: '#38a169',
                color: 'white',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 14,
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              📥 PDFをダウンロード
            </a>
          </div>
        )}

        {/* 対応専門用語タグ */}
        <div style={{
          background: 'white',
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 18,
          padding: '18px 18px 14px',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryText, display: 'block', marginBottom: 10 }}>
            対応している専門用語（例）
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['k2tog（左上2目一度）', 'yo（かけ目）', 'ssk（右上2目一度）', 'cast on（作り目）', 'bind off（伏せ目）', 'm1l（左ねじり増し目）', 'short rows（引き返し編み）'].map(tag => (
              <span key={tag} style={{
                background: COLORS.primaryLight,
                border: `1px solid ${COLORS.primaryBorder}`,
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 12,
                color: COLORS.subText,
              }}>{tag}</span>
            ))}
          </div>
        </div>


        {/* 広告スペース下 */}
        <div style={{
          background: '#fdf5f8',
          border: `1px dashed ${COLORS.primaryBorder}`,
          borderRadius: 12,
          padding: 12,
          textAlign: 'center',
          fontSize: 12,
          color: COLORS.hintText,
        }}>
          広告スペース（Google AdSense）
        </div>

        {/* 意見箱 */}
        <div style={{
          background: 'white',
          border: `1px solid ${COLORS.primaryBorder}`,
          borderRadius: 18,
          padding: '20px 18px',
          marginTop: 16,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 16, margin: '0 0 4px' }}>💌</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryText, margin: '0 0 6px' }}>
            ご意見・ご要望はこちら
          </p>
          <p style={{ fontSize: 12, color: COLORS.subText, margin: '0 0 14px', lineHeight: 1.6 }}>
            「この翻訳がおかしかった」「この用語を追加してほしい」など<br />
            お気軽にお知らせください！
          </p>
          <a
            href="https://tally.so/r/Zjgo5o"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: COLORS.primaryLight,
              border: `1px solid ${COLORS.primaryBorder}`,
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.primaryText,
              textDecoration: 'none',
            }}
          >
            📝 ご意見を送る
          </a>
        </div>
      </div>

      {/* フッター */}
      <footer style={{ textAlign: 'center', fontSize: 11, color: COLORS.hintText, paddingBottom: 24, marginTop: 16 }}>
        編み図PDF翻訳 ｜ Powered by Claude AI 🧶
        <a href="/privacy" className="hover:text-amber-600">プライバシーポリシー</a>
      </footer>
    </main>
  )
}
