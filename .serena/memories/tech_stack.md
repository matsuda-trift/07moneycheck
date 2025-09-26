# MoneyCheck技術スタック

## フロントエンド
- **Next.js 15** - App Router使用必須
- **React 19.1.0** - TypeScript厳格モード
- **Tailwind CSS 4** - スタイリング
- **TypeScript 5** - 型安全性

## 状態管理
- **localStorage** - セッション管理のみ
- **React Context** - DataContext使用
- **DB不使用** - データ永続化なし

## 決済・外部サービス
- **Stripe 18.5.0** - 決済処理
- **Supabase SSR 0.7.0** - クライアント設定（DBは使用しない）

## 開発ツール
- **ESLint 9** - コード品質
- **Turbopack** - 高速ビルド
- **PostCSS** - CSS処理

## デプロイ・実行環境
- **Vercel** - デプロイプラットフォーム
- **Node.js** - サーバーサイド実行