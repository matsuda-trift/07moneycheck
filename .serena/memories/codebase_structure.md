# MoneyCheck コードベース構造

## ディレクトリ構成
```
07moneycheck/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── input/             # 入力ページ
│   │   ├── result/            # 結果表示ページ
│   │   ├── premium/           # 有料版ページ
│   │   ├── layout.tsx         # 全体レイアウト
│   │   ├── page.tsx          # ホームページ
│   │   └── globals.css       # グローバルスタイル
│   ├── components/            # 再利用コンポーネント
│   │   ├── InputForm.tsx     # 入力フォーム
│   │   ├── ScoreDisplay.tsx  # スコア表示
│   │   ├── AdviceCard.tsx    # アドバイスカード
│   │   ├── ProgressBar.tsx   # プログレスバー
│   │   └── ActionCard.tsx    # アクションカード
│   ├── contexts/              # React Context
│   │   └── DataContext.tsx   # データコンテキスト
│   ├── types/                 # TypeScript型定義
│   │   ├── moneycheck.ts     # MoneyCheck固有型
│   │   └── index.ts          # 共通型
│   └── utils/                 # ユーティリティ
│       ├── calculations.ts   # スコア計算ロジック
│       ├── calculation.ts    # 計算ヘルパー
│       └── supabase/         # Supabase設定（DB不使用）
├── docs/                      # ドキュメント
├── public/                    # 静的ファイル
└── 設定ファイル群
```

## 主要ファイルの役割
- **types/moneycheck.ts**: UserData, ScoreResult等の型定義
- **contexts/DataContext.tsx**: セッション状態管理
- **utils/calculations.ts**: 100点満点評価システムロジック
- **components/**: UI再利用コンポーネント群