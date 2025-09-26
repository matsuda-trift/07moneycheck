# MoneyCheck開発ガイド

## 開発原則・制限
* **シンプル最優先**: オーバーエンジニアリング禁止、80/20解決策、カスタム実装優先
* **制限**: DB変更禁止、Pages Router禁止、自動Git push/build禁止（明示的指示時以外）
* **開発サーバー**: npm run devは別ターミナルで実行中、Claude自動実行禁止
* **データベース禁止**: Supabase・PostgreSQL・MySQL等のDB使用禁止、ユーザーデータ保存禁止
* **プライバシー**: ユーザー入力データは一切保存せず、セッション終了時に完全削除
* **品質**: 300行以下・単一責任・TypeScript厳格・変更前ファイル全読み必須

## 技術構成
```
Frontend: Next.js 15 App Router, React, TypeScript, Tailwind CSS
State: localStorage + React Context（DB不使用）
Payment: Stripe Checkout Session
Tools: npm run dev/build/start/lint, Vercel
```

### App Router必須パターン
* **ファイル構成**: `app/`のみ - `page.tsx`/`layout.tsx`/`loading.tsx`/`error.tsx`/`not-found.tsx`
* **コンポーネント**: デフォルトServer、Client`"use client"`はイベント・Hooks・ブラウザAPI時のみ
* **データ**: localStorage + React Context（セッション管理のみ）

### 状態管理実装
```typescript
// types/moneycheck.ts
export interface UserData {
  mainIncome: number;      // 本業手取り給料
  sideIncome: number;      // 副業収入
  investment: number;      // 投資額
  consumption: number;     // 消費
  waste: number;           // 浪費
  savings: number;         // 銀行預金
  stockIncome: number;     // ストック収入
  creditPayment: number;   // クレカ支払い
  subscription: number;    // サブスク
}

// contexts/DataContext.tsx
"use client";
export const DataContext = createContext<{
  userData: UserData;
  setUserData: (data: UserData) => void;
}>()
```
* **セッション**: localStorage使用、DB不使用・データ永続化なし・ユーザーデータ非保存

### 必須ヘッダー（全ファイル）
```
// 1. ファイル位置 2. 機能説明 3. 存在理由 4. 関連ファイル（2-4個）
```

## MoneyCheck仕様

### プロジェクト概要（2日開発）
男子大学生向け単発資産テストツール - シンプル・80/20・オーバーエンジニアリング禁止

### 入力（9項目・複数ページ）
1. 本業手取り給料（月） 2. 副業収入（月） 3. 投資 4. 消費（生活必需品） 5. 浪費 6. 銀行預金 7. ストック（寝てても稼げる収入・月） 8. クレカ支払い 9. サブスク
* 数値のみ円単位・マイナス値異常値は再入力・プログレスバー・戻る機能・途中保存なし

### 評価システム（100点満点・19項目）
#### Sランク（各12点・計48点）
1. 収入>支出 2. ストック収入>0 3. 消費<ストック収入 4. ストック収入>サブスク

#### Aランク（各6点・計18点）
1. 投資>浪費 2. 銀行預金>クレカ支払い 3. 投資額>0

#### Bランク（各2点・計34点）
1. 副業収入>0 2. 投資>消費 3. サブスク存在 4. 本業<副業 5. 浪費比率（0-10%:2点、11-20%:1点、21%+:0点）
6. ストック÷消費比率（100%+:2点、50-99%:1点、50%未満:0点） 7. 預金÷月支出比率（600%+:2点、300-599%:1点、300%未満:0点）
8. 投資÷収入比率（20%+:2点、10-19%:1点、10%未満:0点） 9. サブスク÷収入比率（0-5%:2点、6-10%:1点、11%+:0点）
10. クレカ÷収入比率（0-10%:2点、11-30%:1点、31%+:0点）

### フィードバック
* **無料版**: 総合スコア・10点刻みアドバイス・パーソナライズドアクション1つ
* **有料版（500円）**: 詳細スコア内訳（S/A/B別）・各比率詳細・詳細アドバイス・実行難易度別アクション

### パーソナライズドアクション優先順位
1. **Sランク未達成**（12点）最優先 2. **Aランク未達成**（6点）次優先 3. **Bランク未達成**（2点）補助的

### 技術仕様
* **決済**: Stripe・クレカ・PayPay **シェア**: SNS画像生成・テキスト **その他**: 再テスト・問い合わせ・GA
* **非機能**: レスポンス1秒未満・10人同時・DB不使用・データ永続化なし・ユーザー登録不要
* **UI/UX**: モバイルファースト・黒白深青・Apple/ChatGPT品質・9ページ入力フロー

### 重要概念
* **ストック**: 寝てても稼げる収入 **サブスク**: 勝手に減る支出 **支出分類**: 個人判断（結婚目的アプリ=投資、性欲目的=浪費）
* **加点評価**: ポジティブ改善重視

### スケジュール
* **Day 1**: 入力画面・計算ロジック・無料版結果
* **Day 2**: Stripe連携・有料版結果・シェア機能

### 計算ロジック例
```typescript
const generatePersonalizedAction = (data: UserData, missedItems: string[]) => {
  if (missedItems.includes('income_vs_expense')) {
    return data.totalIncome < data.totalExpense
      ? `支出を月${Math.ceil((data.totalExpense - data.totalIncome) / 1000)}千円減らす`
      : `収入を月${Math.ceil((data.totalExpense - data.totalIncome) / 1000)}千円増やす`;
  }
  if (missedItems.includes('has_stock') && data.stockIncome === 0) {
    return "月1,000円でも投資信託を始めてみる";
  }
  return "家計簿アプリで支出を記録する";
};
```