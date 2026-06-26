'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [direction, setDirection] = useState('en_to_ja')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('idle') // idle | uploading | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadName, setDownloadName] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !apiKey) return

    setStatus('uploading')
    setErrorMsg('')
    setDownloadUrl('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('direction', direction)
      formData.append('api_key', apiKey)

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
    <main className="min-h-screen bg-stone-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-3xl">🧶</span>
          <div>
            <h1 className="text-xl font-bold text-stone-800">編み図PDF翻訳</h1>
            <p className="text-sm text-stone-500">英語 ↔ 日本語 | 編み物専門用語対応</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* 広告スペース（AdSense設置場所） */}
        <div className="bg-stone-100 border border-stone-200 rounded-lg p-4 mb-8 text-center text-stone-400 text-sm">
          広告スペース（Google AdSense）
        </div>

        {/* メインフォーム */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 翻訳方向 */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                翻訳の方向
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirection('en_to_ja')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    direction === 'en_to_ja'
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  🇺🇸 英語 → 日本語 🇯🇵
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('ja_to_en')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    direction === 'ja_to_en'
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  🇯🇵 日本語 → 英語 🇺🇸
                </button>
              </div>
            </div>

            {/* PDFアップロード */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                編み図PDF
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  file ? 'border-rose-300 bg-rose-50' : 'border-stone-300 hover:border-rose-300'
                }`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <p className="text-2xl mb-1">📄</p>
                    <p className="text-sm font-medium text-stone-700">{file.name}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📂</p>
                    <p className="text-sm text-stone-500">クリックしてPDFを選択</p>
                    <p className="text-xs text-stone-400 mt-1">最大20MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* APIキー */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Anthropic APIキー
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <p className="text-xs text-stone-400 mt-1">
                APIキーはサーバーに保存されません。
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
                   className="text-rose-500 underline ml-1">取得はこちら</a>
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={!file || !apiKey || status === 'uploading'}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                !file || !apiKey || status === 'uploading'
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 active:scale-95'
              }`}
            >
              {status === 'uploading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  翻訳中... しばらくお待ちください
                </span>
              ) : '翻訳する'}
            </button>
          </form>

          {/* エラー */}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ❌ {errorMsg}
            </div>
          )}

          {/* 完了・ダウンロード */}
          {status === 'done' && downloadUrl && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-semibold text-green-700 mb-4">翻訳が完了しました！</p>
              <a
                href={downloadUrl}
                download={downloadName}
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                📥 PDFをダウンロード
              </a>
            </div>
          )}
        </div>

        {/* 使い方説明 */}
        <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-700 mb-4">使い方</h2>
          <ol className="space-y-2 text-sm text-stone-600">
            <li className="flex gap-3"><span className="text-rose-400 font-bold">1.</span> 翻訳の方向を選ぶ（英→日 または 日→英）</li>
            <li className="flex gap-3"><span className="text-rose-400 font-bold">2.</span> 編み図PDFをアップロード</li>
            <li className="flex gap-3"><span className="text-rose-400 font-bold">3.</span> Anthropic APIキーを入力</li>
            <li className="flex gap-3"><span className="text-rose-400 font-bold">4.</span> 「翻訳する」ボタンを押してダウンロード</li>
          </ol>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            💡 k2tog・yo・ssk など編み物の専門用語に対応しています
          </div>
        </div>

        {/* 広告スペース2 */}
        <div className="bg-stone-100 border border-stone-200 rounded-lg p-4 mt-8 text-center text-stone-400 text-sm">
          広告スペース（Google AdSense）
        </div>
      </div>

      <footer className="text-center text-xs text-stone-400 py-8">
        編み図PDF翻訳 | Powered by Claude AI
      </footer>
    </main>
  )
}
