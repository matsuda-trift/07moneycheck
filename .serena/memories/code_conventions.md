# MoneyCheck コーディング規約

## ファイル・ディレクトリ構成
```
src/
├── app/               # Next.js 15 App Router（必須）
│   ├── page.tsx      # ページコンポーネント
│   ├── layout.tsx    # レイアウト
│   ├── loading.tsx   # ローディング
│   └── error.tsx     # エラー処理
├── components/        # 再利用可能コンポーネント
├── contexts/          # React Context
├── types/            # TypeScript型定義
└── utils/            # ユーティリティ関数
```

## TypeScript規約
- **strict mode** 必須
- **型注釈** 明示的に記述
- **interface** 使用を優先
- **export default** デフォルトエクスポート使用

## React規約
- **Server Components** デフォルト
- **Client Components** (`"use client"`) はイベント・Hooks・ブラウザAPI使用時のみ
- **単一責任原則** 1コンポーネント1機能
- **300行以下** ファイルサイズ制限

## 必須ヘッダー形式
```typescript
// src/path/to/file.tsx
// 機能説明
// 存在理由
// 関連ファイル: file1.tsx, file2.tsx
```

## 命名規約
- **PascalCase**: コンポーネント、型、インターフェース
- **camelCase**: 変数、関数
- **SCREAMING_SNAKE_CASE**: 定数