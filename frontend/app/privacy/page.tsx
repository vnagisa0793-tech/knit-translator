export const metadata = {
  title: 'プライバシーポリシー | 編み図PDF翻訳',
  description: '編み図PDF翻訳サービスのプライバシーポリシーです。',
}

export default function PrivacyPage() {
  const lastUpdated = '2026年6月29日'

  return (
    <main className="min-h-screen bg-amber-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-amber-100 py-4 px-6">
        <a href="/" className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-2">
          🧶 <span>編み図PDF翻訳</span>
        </a>
      </header>

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-10">最終更新日：{lastUpdated}</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">はじめに</h2>
            <p>
              編み図PDF翻訳（以下「本サービス」）は、個人が運営する無料の翻訳サービスです。
              本プライバシーポリシーは、本サービスの利用にあたって収集する情報とその取り扱いについて説明します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">収集する情報</h2>
            <p className="mb-3">本サービスでは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>アップロードされたPDFファイル（翻訳処理のためのみに使用し、サーバーへの保存は行いません）</li>
              <li>アクセスログ（IPアドレス、ブラウザの種類、アクセス日時など）</li>
              <li>Cookieおよびこれに類する技術による利用状況データ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">PDFファイルの取り扱い</h2>
            <p>
              アップロードされたPDFは翻訳処理のためにのみ使用します。
              翻訳処理にはClaude AI（Anthropic社）のAPIを利用しており、処理完了後にデータは破棄されます。
              PDFの内容を第三者に販売・提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Google AdSenseについて</h2>
            <p className="mb-3">
              本サービスでは、Google AdSenseを利用した広告を掲載しています。
              Google AdSenseは、ユーザーの興味に応じた広告を表示するためにCookieを使用します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Googleはこれらの情報を使用して、ユーザーへの広告配信を最適化します</li>
              <li>
                Googleのプライバシーポリシーは{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  こちら
                </a>
                をご確認ください
              </li>
              <li>
                広告のパーソナライズを無効にしたい場合は{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Googleの広告設定
                </a>
                から変更できます
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Google Analyticsについて</h2>
            <p>
              本サービスでは、サービス改善のためにGoogle Analyticsを利用する場合があります。
              Google AnalyticsはCookieを使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。
              収集されたデータはGoogleのプライバシーポリシーに基づいて管理されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Cookieについて</h2>
            <p>
              本サービスはCookieを使用しています。ブラウザの設定からCookieを無効にすることができますが、
              一部の機能が正常に動作しなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">第三者へのデータ提供</h2>
            <p>
              法令に基づく場合を除き、ユーザーの個人情報を第三者に提供・開示することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">プライバシーポリシーの変更</h2>
            <p>
              本ポリシーは必要に応じて改訂することがあります。重要な変更がある場合は、
              本ページにてお知らせします。最新の内容は常に本ページをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">お問い合わせ</h2>
            <p>
              本プライバシーポリシーに関するご質問は、下記までお気軽にご連絡ください。
            </p>
            <p className="mt-2">
              <a
                href="mailto:vnagisa0793@gmail.com"
                className="text-amber-700 underline hover:text-amber-900"
              >
                vnagisa0793@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>

      {/* フッター */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-amber-100 mt-8">
        <p>編み図PDF翻訳 ｜ Powered by Claude AI 🧶</p>
        <p className="mt-1">
          <a href="/" className="hover:text-amber-600">トップへ戻る</a>
        </p>
      </footer>
    </main>
  )
}
