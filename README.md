# 編み図PDF翻訳 Webアプリ

## フォルダ構成

```
knit-translator/
├── backend/          ← FastAPI（Renderにデプロイ）
│   ├── main.py
│   ├── requirements.txt
│   └── knitting_glossary.csv
└── frontend/         ← Next.js（Vercelにデプロイ）
    ├── app/
    │   ├── page.jsx
    │   ├── layout.js
    │   └── globals.css
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## デプロイ手順

### Step 1: GitHubにアップロード

1. GitHubで新しいリポジトリを作成（例: `knit-translator`）
2. このフォルダをプッシュ

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/あなたのユーザー名/knit-translator.git
git push -u origin main
```

---

### Step 2: バックエンドをRenderにデプロイ

1. https://render.com にアクセス（GitHubでサインアップ）
2. 「New +」→「Web Service」
3. GitHubリポジトリを選択
4. 以下を設定：

| 項目 | 値 |
|------|-----|
| Name | knit-translator-api |
| Root Directory | backend |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

5. 「Create Web Service」→ デプロイ完了後にURLをメモ
   例: `https://knit-translator-api.onrender.com`

---

### Step 3: フロントエンドをVercelにデプロイ

1. https://vercel.com にアクセス（GitHubでサインアップ）
2. 「New Project」→ GitHubリポジトリを選択
3. 「Root Directory」を `frontend` に変更
4. 「Environment Variables」に追加：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://knit-translator-api.onrender.com`（Step2のURL）
5. 「Deploy」→ 完了！

---

### Step 4: 独自ドメインの設定（任意）

1. お名前.com や Xserver Domainでドメイン取得（年1,000〜2,000円）
2. Vercelダッシュボード → Settings → Domains → ドメインを追加

---

### Step 5: Google AdSense申請

1. https://adsense.google.com でアカウント作成
2. サイトURLを登録して審査申請
3. 審査通過後、`frontend/app/page.jsx` の「広告スペース」部分を
   AdSenseのコードに置き換える

---

## ローカルでテストする場合

### バックエンド起動
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000 で起動
```

### フロントエンド起動
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
# http://localhost:3000 で起動
```

---

## 注意事項

- Claude APIキーはユーザーが入力する方式のため、サーバーに保存されません
- Renderの無料プランはアクセスがないと15分でスリープします（有料プランで解決）
- 大量アクセス時はRenderの有料プラン（月7ドル〜）への移行を検討してください
