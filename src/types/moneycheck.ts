// src/types/moneycheck.ts
// MoneyCheck診断データの型定義
// ユーザー入力データ構造（CLAUDE.mdの仕様に準拠）
// 関連: contexts/DataContext.tsx, utils/calculations.ts, app/input/page.tsx

export interface UserData {
  mainIncome: number;      // 本業手取り給料（月）
  sideIncome: number;      // 副業収入（月）
  investment: number;      // 投資額（月）
  consumption: number;     // 消費（生活必需品、月）
  waste: number;           // 浪費（月）
  savings: number;         // 銀行預金残高
  stockIncome: number;     // ストック収入（寝てても稼げる収入、月）
  creditPayment: number;   // クレカ支払い（月）
  subscription: number;    // サブスクリプション（月）
}

export interface ScoreResult {
  totalScore: number;      // 総合スコア（100点満点）
  sRankScore: number;      // Sランクスコア（48点満点）
  aRankScore: number;      // Aランクスコア（18点満点）
  bRankScore: number;      // Bランクスコア（34点満点）
  rank: string;            // 総合ランク（S, A, B, C, D）
  feedback: string;        // フィードバックメッセージ
  personalizedAction: string; // パーソナライズドアクション
}

export interface InputStep {
  id: keyof UserData;
  title: string;
  description: string;
  unit: string;
  placeholder: string;
  examples: string[];
}

export const INPUT_STEPS: InputStep[] = [
  {
    id: 'mainIncome',
    title: '本業の手取り給料',
    description: 'アルバイトや就職後の月の手取り収入を入力してください',
    unit: '円/月',
    placeholder: '200000',
    examples: ['アルバイト: 80,000円', '新卒: 200,000円', '高収入: 300,000円']
  },
  {
    id: 'sideIncome',
    title: '副業収入',
    description: '副業やフリーランスでの月収入を入力してください（なければ0）',
    unit: '円/月',
    placeholder: '50000',
    examples: ['なし: 0円', 'せどり: 30,000円', 'プログラミング: 100,000円']
  },
  {
    id: 'investment',
    title: '投資額',
    description: '株式・投資信託・仮想通貨など月の投資額を入力してください',
    unit: '円/月',
    placeholder: '20000',
    examples: ['なし: 0円', 'つみたてNISA: 33,333円', '積極投資: 50,000円']
  },
  {
    id: 'consumption',
    title: '生活必需品の消費',
    description: '食費・光熱費・交通費など生活に必要な月の支出を入力してください',
    unit: '円/月',
    placeholder: '80000',
    examples: ['実家暮らし: 30,000円', '一人暮らし: 80,000円', '都心部: 120,000円']
  },
  {
    id: 'waste',
    title: '浪費',
    description: '娯楽・嗜好品・無駄遣いなど月の浪費額を入力してください',
    unit: '円/月',
    placeholder: '30000',
    examples: ['節約家: 10,000円', '普通: 30,000円', '散財: 100,000円']
  },
  {
    id: 'savings',
    title: '銀行預金残高',
    description: '現在の銀行口座の預金残高を入力してください',
    unit: '円',
    placeholder: '500000',
    examples: ['学生: 100,000円', '新社会人: 500,000円', '貯金家: 1,000,000円']
  },
  {
    id: 'stockIncome',
    title: 'ストック収入',
    description: '配当・不動産・ブログなど寝てても稼げる月収入を入力してください',
    unit: '円/月',
    placeholder: '5000',
    examples: ['なし: 0円', '配当金: 3,000円', '不動産: 50,000円']
  },
  {
    id: 'creditPayment',
    title: 'クレジットカード支払い',
    description: '月のクレジットカード支払い額を入力してください',
    unit: '円/月',
    placeholder: '50000',
    examples: ['現金主義: 0円', '普通: 50,000円', 'カード派: 150,000円']
  },
  {
    id: 'subscription',
    title: 'サブスクリプション',
    description: 'Netflix・Spotify・ジムなど月額サービスの総額を入力してください',
    unit: '円/月',
    placeholder: '3000',
    examples: ['最小限: 1,000円', '普通: 3,000円', '多数契約: 10,000円']
  }
];