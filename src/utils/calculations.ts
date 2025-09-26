// src/utils/calculations.ts
// MoneyCheck診断の100点満点スコア計算ロジック
// S/A/Bランク判定とパーソナライズドアクション生成
// 関連: types/moneycheck.ts, contexts/DataContext.tsx, app/result/page.tsx

import { UserData, ScoreResult } from '@/types/moneycheck';

export interface DetailedScoreResult extends ScoreResult {
  sRankDetails: { [key: string]: number };
  aRankDetails: { [key: string]: number };
  bRankDetails: { [key: string]: number };
  missedItems: string[];
  ratios: {
    wasteRatio: number;
    stockToConsumptionRatio: number;
    savingsToExpenseRatio: number;
    investmentToIncomeRatio: number;
    subscriptionToIncomeRatio: number;
    creditToIncomeRatio: number;
  };
  actionsByDifficulty: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  detailedAdvice: string[];
}

export function calculateMoneyScore(data: UserData): ScoreResult {
  const totalIncome = data.mainIncome + data.sideIncome + data.stockIncome;
  const totalExpense = data.consumption + data.waste + data.subscription;
  const monthlyExpense = totalExpense + data.creditPayment;

  // Sランク判定（各12点・計48点）
  const sRankScore = calculateSRank(data, totalIncome, totalExpense);

  // Aランク判定（各6点・計18点）
  const aRankScore = calculateARank(data);

  // Bランク判定（各2点・計34点）
  const bRankScore = calculateBRank(data, totalIncome, monthlyExpense);

  const totalScore = sRankScore.total + aRankScore.total + bRankScore.total;
  const rank = determineRank(totalScore);
  const feedback = generateFeedback(totalScore, rank);
  const personalizedAction = generatePersonalizedAction(data, [
    ...sRankScore.missed,
    ...aRankScore.missed,
    ...bRankScore.missed
  ]);

  return {
    totalScore,
    sRankScore: sRankScore.total,
    aRankScore: aRankScore.total,
    bRankScore: bRankScore.total,
    rank,
    feedback,
    personalizedAction
  };
}

function calculateSRank(data: UserData, totalIncome: number, totalExpense: number) {
  let score = 0;
  const missed: string[] = [];

  // 1. 収入 > 支出
  if (totalIncome > totalExpense) {
    score += 12;
  } else {
    missed.push('income_vs_expense');
  }

  // 2. ストック収入 > 0
  if (data.stockIncome > 0) {
    score += 12;
  } else {
    missed.push('has_stock');
  }

  // 3. 消費 < ストック収入
  if (data.consumption < data.stockIncome) {
    score += 12;
  } else {
    missed.push('stock_covers_consumption');
  }

  // 4. ストック収入 > サブスク
  if (data.stockIncome > data.subscription) {
    score += 12;
  } else {
    missed.push('stock_covers_subscription');
  }

  return { total: score, missed };
}

function calculateARank(data: UserData) {
  let score = 0;
  const missed: string[] = [];

  // 1. 投資 > 浪費
  if (data.investment > data.waste) {
    score += 6;
  } else {
    missed.push('investment_vs_waste');
  }

  // 2. 銀行預金 > クレカ支払い
  if (data.savings > data.creditPayment) {
    score += 6;
  } else {
    missed.push('savings_vs_credit');
  }

  // 3. 投資額 > 0
  if (data.investment > 0) {
    score += 6;
  } else {
    missed.push('has_investment');
  }

  return { total: score, missed };
}

function calculateBRank(data: UserData, totalIncome: number, monthlyExpense: number) {
  let score = 0;
  const missed: string[] = [];

  // 1. 副業収入 > 0
  if (data.sideIncome > 0) {
    score += 2;
  } else {
    missed.push('has_side_income');
  }

  // 2. 投資 > 消費
  if (data.investment > data.consumption) {
    score += 2;
  } else {
    missed.push('investment_vs_consumption');
  }

  // 3. サブスク存在
  if (data.subscription > 0) {
    score += 2;
  } else {
    missed.push('has_subscription');
  }

  // 4. 本業 < 副業
  if (data.mainIncome < data.sideIncome) {
    score += 2;
  } else {
    missed.push('side_exceeds_main');
  }

  // 5. 浪費比率（0-10%: 2点、11-20%: 1点、21%+: 0点）
  const wasteRatio = totalIncome > 0 ? (data.waste / totalIncome) * 100 : 0;
  if (wasteRatio <= 10) {
    score += 2;
  } else if (wasteRatio <= 20) {
    score += 1;
  } else {
    missed.push('waste_ratio_high');
  }

  // 6. ストック÷消費比率（100%+: 2点、50-99%: 1点、50%未満: 0点）
  const stockToConsumptionRatio = data.consumption > 0 ? (data.stockIncome / data.consumption) * 100 : 0;
  if (stockToConsumptionRatio >= 100) {
    score += 2;
  } else if (stockToConsumptionRatio >= 50) {
    score += 1;
  } else {
    missed.push('stock_to_consumption_low');
  }

  // 7. 預金÷月支出比率（600%+: 2点、300-599%: 1点、300%未満: 0点）
  const savingsToExpenseRatio = monthlyExpense > 0 ? (data.savings / monthlyExpense) * 100 : 0;
  if (savingsToExpenseRatio >= 600) {
    score += 2;
  } else if (savingsToExpenseRatio >= 300) {
    score += 1;
  } else {
    missed.push('savings_to_expense_low');
  }

  // 8. 投資÷収入比率（20%+: 2点、10-19%: 1点、10%未満: 0点）
  const investmentToIncomeRatio = totalIncome > 0 ? (data.investment / totalIncome) * 100 : 0;
  if (investmentToIncomeRatio >= 20) {
    score += 2;
  } else if (investmentToIncomeRatio >= 10) {
    score += 1;
  } else {
    missed.push('investment_ratio_low');
  }

  // 9. サブスク÷収入比率（0-5%: 2点、6-10%: 1点、11%+: 0点）
  const subscriptionToIncomeRatio = totalIncome > 0 ? (data.subscription / totalIncome) * 100 : 0;
  if (subscriptionToIncomeRatio <= 5) {
    score += 2;
  } else if (subscriptionToIncomeRatio <= 10) {
    score += 1;
  } else {
    missed.push('subscription_ratio_high');
  }

  // 10. クレカ÷収入比率（0-10%: 2点、11-30%: 1点、31%+: 0点）
  const creditToIncomeRatio = totalIncome > 0 ? (data.creditPayment / totalIncome) * 100 : 0;
  if (creditToIncomeRatio <= 10) {
    score += 2;
  } else if (creditToIncomeRatio <= 30) {
    score += 1;
  } else {
    missed.push('credit_ratio_high');
  }

  return { total: score, missed };
}

function determineRank(totalScore: number): string {
  if (totalScore >= 90) return 'S';
  if (totalScore >= 80) return 'A';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 60) return 'C';
  return 'D';
}

function generateFeedback(totalScore: number, rank: string): string {
  if (totalScore >= 90) {
    return '素晴らしい！理想的な資産管理ができています。';
  } else if (totalScore >= 80) {
    return '良好です。細かい部分を調整すればさらに向上できます。';
  } else if (totalScore >= 70) {
    return 'まずまずです。重点的な改善で大きく向上できます。';
  } else if (totalScore >= 60) {
    return '平均的です。基本的な改善から始めましょう。';
  } else {
    return 'まだ改善の余地が大きくあります。基本から見直しましょう。';
  }
}

export function calculateDetailedMoneyScore(data: UserData): DetailedScoreResult {
  const totalIncome = data.mainIncome + data.sideIncome + data.stockIncome;
  const totalExpense = data.consumption + data.waste + data.subscription;
  const monthlyExpense = totalExpense + data.creditPayment;

  // S/A/Bランクの詳細計算
  const sRankResult = calculateSRankDetailed(data, totalIncome, totalExpense);
  const aRankResult = calculateARankDetailed(data);
  const bRankResult = calculateBRankDetailed(data, totalIncome, monthlyExpense);

  const totalScore = sRankResult.total + aRankResult.total + bRankResult.total;
  const rank = determineRank(totalScore);
  const feedback = generateFeedback(totalScore, rank);

  const allMissedItems = [
    ...sRankResult.missed,
    ...aRankResult.missed,
    ...bRankResult.missed
  ];

  const personalizedAction = generatePersonalizedAction(data, allMissedItems);

  // 比率計算
  const ratios = calculateRatios(data, totalIncome, monthlyExpense);

  // 実行難易度別アクション生成
  const actionsByDifficulty = generateActionsByDifficulty(data, allMissedItems);

  // 詳細アドバイス生成
  const detailedAdvice = generateDetailedAdvice(data, allMissedItems, ratios);

  return {
    totalScore,
    sRankScore: sRankResult.total,
    aRankScore: aRankResult.total,
    bRankScore: bRankResult.total,
    rank,
    feedback,
    personalizedAction,
    sRankDetails: sRankResult.details,
    aRankDetails: aRankResult.details,
    bRankDetails: bRankResult.details,
    missedItems: allMissedItems,
    ratios,
    actionsByDifficulty,
    detailedAdvice
  };
}

function calculateSRankDetailed(data: UserData, totalIncome: number, totalExpense: number) {
  let score = 0;
  const missed: string[] = [];
  const details: { [key: string]: number } = {};

  // 1. 収入 > 支出
  if (totalIncome > totalExpense) {
    score += 12;
    details['収入vs支出'] = 12;
  } else {
    missed.push('income_vs_expense');
    details['収入vs支出'] = 0;
  }

  // 2. ストック収入 > 0
  if (data.stockIncome > 0) {
    score += 12;
    details['ストック収入'] = 12;
  } else {
    missed.push('has_stock');
    details['ストック収入'] = 0;
  }

  // 3. 消費 < ストック収入
  if (data.consumption < data.stockIncome) {
    score += 12;
    details['ストック収入vs消費'] = 12;
  } else {
    missed.push('stock_covers_consumption');
    details['ストック収入vs消費'] = 0;
  }

  // 4. ストック収入 > サブスク
  if (data.stockIncome > data.subscription) {
    score += 12;
    details['ストック収入vsサブスク'] = 12;
  } else {
    missed.push('stock_covers_subscription');
    details['ストック収入vsサブスク'] = 0;
  }

  return { total: score, missed, details };
}

function calculateARankDetailed(data: UserData) {
  let score = 0;
  const missed: string[] = [];
  const details: { [key: string]: number } = {};

  // 1. 投資 > 浪費
  if (data.investment > data.waste) {
    score += 6;
    details['投資vs浪費'] = 6;
  } else {
    missed.push('investment_vs_waste');
    details['投資vs浪費'] = 0;
  }

  // 2. 銀行預金 > クレカ支払い
  if (data.savings > data.creditPayment) {
    score += 6;
    details['預金vsクレカ'] = 6;
  } else {
    missed.push('savings_vs_credit');
    details['預金vsクレカ'] = 0;
  }

  // 3. 投資額 > 0
  if (data.investment > 0) {
    score += 6;
    details['投資実行'] = 6;
  } else {
    missed.push('has_investment');
    details['投資実行'] = 0;
  }

  return { total: score, missed, details };
}

function calculateBRankDetailed(data: UserData, totalIncome: number, monthlyExpense: number) {
  let score = 0;
  const missed: string[] = [];
  const details: { [key: string]: number } = {};

  // 1. 副業収入 > 0
  if (data.sideIncome > 0) {
    score += 2;
    details['副業収入'] = 2;
  } else {
    missed.push('has_side_income');
    details['副業収入'] = 0;
  }

  // 2. 投資 > 消費
  if (data.investment > data.consumption) {
    score += 2;
    details['投資vs消費'] = 2;
  } else {
    missed.push('investment_vs_consumption');
    details['投資vs消費'] = 0;
  }

  // 3. サブスク存在
  if (data.subscription > 0) {
    score += 2;
    details['サブスク利用'] = 2;
  } else {
    missed.push('has_subscription');
    details['サブスク利用'] = 0;
  }

  // 4. 本業 < 副業
  if (data.mainIncome < data.sideIncome) {
    score += 2;
    details['副業優位'] = 2;
  } else {
    missed.push('side_exceeds_main');
    details['副業優位'] = 0;
  }

  // 5-10の比率項目
  const ratioScores = calculateRatioScores(data, totalIncome, monthlyExpense);
  Object.entries(ratioScores.scores).forEach(([key, value]) => {
    score += value;
    details[key] = value;
  });
  missed.push(...ratioScores.missed);

  return { total: score, missed, details };
}

function calculateRatioScores(data: UserData, totalIncome: number, monthlyExpense: number) {
  const scores: { [key: string]: number } = {};
  const missed: string[] = [];

  // 5. 浪費比率
  const wasteRatio = totalIncome > 0 ? (data.waste / totalIncome) * 100 : 0;
  if (wasteRatio <= 10) {
    scores['浪費比率'] = 2;
  } else if (wasteRatio <= 20) {
    scores['浪費比率'] = 1;
  } else {
    scores['浪費比率'] = 0;
    missed.push('waste_ratio_high');
  }

  // 6. ストック÷消費比率
  const stockToConsumptionRatio = data.consumption > 0 ? (data.stockIncome / data.consumption) * 100 : 0;
  if (stockToConsumptionRatio >= 100) {
    scores['ストック/消費比率'] = 2;
  } else if (stockToConsumptionRatio >= 50) {
    scores['ストック/消費比率'] = 1;
  } else {
    scores['ストック/消費比率'] = 0;
    missed.push('stock_to_consumption_low');
  }

  // 7. 預金÷月支出比率
  const savingsToExpenseRatio = monthlyExpense > 0 ? (data.savings / monthlyExpense) * 100 : 0;
  if (savingsToExpenseRatio >= 600) {
    scores['預金/支出比率'] = 2;
  } else if (savingsToExpenseRatio >= 300) {
    scores['預金/支出比率'] = 1;
  } else {
    scores['預金/支出比率'] = 0;
    missed.push('savings_to_expense_low');
  }

  // 8. 投資÷収入比率
  const investmentToIncomeRatio = totalIncome > 0 ? (data.investment / totalIncome) * 100 : 0;
  if (investmentToIncomeRatio >= 20) {
    scores['投資/収入比率'] = 2;
  } else if (investmentToIncomeRatio >= 10) {
    scores['投資/収入比率'] = 1;
  } else {
    scores['投資/収入比率'] = 0;
    missed.push('investment_ratio_low');
  }

  // 9. サブスク÷収入比率
  const subscriptionToIncomeRatio = totalIncome > 0 ? (data.subscription / totalIncome) * 100 : 0;
  if (subscriptionToIncomeRatio <= 5) {
    scores['サブスク/収入比率'] = 2;
  } else if (subscriptionToIncomeRatio <= 10) {
    scores['サブスク/収入比率'] = 1;
  } else {
    scores['サブスク/収入比率'] = 0;
    missed.push('subscription_ratio_high');
  }

  // 10. クレカ÷収入比率
  const creditToIncomeRatio = totalIncome > 0 ? (data.creditPayment / totalIncome) * 100 : 0;
  if (creditToIncomeRatio <= 10) {
    scores['クレカ/収入比率'] = 2;
  } else if (creditToIncomeRatio <= 30) {
    scores['クレカ/収入比率'] = 1;
  } else {
    scores['クレカ/収入比率'] = 0;
    missed.push('credit_ratio_high');
  }

  return { scores, missed };
}

function calculateRatios(data: UserData, totalIncome: number, monthlyExpense: number) {
  // 安全な除算ヘルパー関数
  const safeDivision = (numerator: number, denominator: number): number => {
    // 無効な値や0除算をチェック
    if (typeof numerator !== 'number' || typeof denominator !== 'number' ||
        !isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
      return 0;
    }

    const result = (numerator / denominator) * 100;
    return isFinite(result) ? result : 0;
  };

  return {
    wasteRatio: safeDivision(data.waste, totalIncome),
    stockToConsumptionRatio: safeDivision(data.stockIncome, data.consumption),
    savingsToExpenseRatio: safeDivision(data.savings, monthlyExpense),
    investmentToIncomeRatio: safeDivision(data.investment, totalIncome),
    subscriptionToIncomeRatio: safeDivision(data.subscription, totalIncome),
    creditToIncomeRatio: safeDivision(data.creditPayment, totalIncome),
  };
}

// 金額をカンマ区切りでフォーマットするヘルパー関数
function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP');
}

export function generatePersonalizedAction(data: UserData, missedItems: string[]): string {
  const totalIncome = data.mainIncome + data.sideIncome + data.stockIncome;
  const totalExpense = data.consumption + data.waste + data.subscription;

  // Sランク未達成を最優先（ストック収入関連は除外）
  if (missedItems.includes('income_vs_expense')) {
    const deficit = totalExpense - totalIncome;
    return deficit > 0
      ? `支出を月${formatAmount(Math.ceil(deficit / 1000) * 1000)}円減らしましょう`
      : `収入を月${formatAmount(Math.ceil(-deficit / 1000) * 1000)}円増やしましょう`;
  }

  // Aランク未達成を次優先
  if (missedItems.includes('investment_vs_waste')) {
    const needed = data.waste - data.investment + 1000;
    return `投資額を月${formatAmount(Math.ceil(needed / 1000) * 1000)}円増やしましょう`;
  }

  if (missedItems.includes('savings_vs_credit')) {
    return 'クレジットカードの利用を控えて預金を増やしましょう';
  }

  if (missedItems.includes('has_investment')) {
    return 'つみたてNISAから投資を始めてみましょう';
  }

  // Bランク改善提案
  if (missedItems.includes('has_side_income')) {
    return '副業やフリーランスで収入源を増やしましょう';
  }

  if (missedItems.includes('investment_vs_consumption')) {
    const needed = data.consumption - data.investment + 1000;
    return `投資額を月${formatAmount(Math.ceil(needed / 1000) * 1000)}円増やして消費を上回らせましょう`;
  }

  if (missedItems.includes('waste_ratio_high')) {
    const targetWaste = Math.floor(totalIncome * 0.1);
    const reduction = data.waste - targetWaste;
    return `浪費を月${formatAmount(Math.ceil(reduction / 1000) * 1000)}円減らして収入の10%以下にしましょう`;
  }

  if (missedItems.includes('investment_ratio_low')) {
    const targetInvestment = Math.floor(totalIncome * 0.1);
    const increase = targetInvestment - data.investment;
    return `投資額を月${formatAmount(Math.ceil(increase / 1000) * 1000)}円増やして収入の10%以上にしましょう`;
  }

  // デフォルト
  return '家計簿アプリで支出を記録して現状把握から始めましょう';
}

export function generateActionsByDifficulty(data: UserData, missedItems: string[]) {
  const easy: string[] = [];
  const medium: string[] = [];
  const hard: string[] = [];

  // 簡単（今すぐできる）
  if (missedItems.includes('has_subscription')) {
    easy.push('使っていないサブスクを今すぐ解約する');
  }
  if (missedItems.includes('credit_ratio_high')) {
    easy.push('クレジットカードの明細を確認し、不要な支払いを停止する');
  }
  if (data.waste > data.investment) {
    easy.push('今月の浪費予算を1万円減らしてその分を投資に回す');
  }
  easy.push('家計簿アプリをダウンロードして支出を記録開始');
  easy.push('銀行口座の残高を確認して現状を把握する');

  // 中級（1-3ヶ月で実行）
  if (missedItems.includes('has_investment')) {
    medium.push('つみたてNISAの口座を開設して月1万円から投資開始');
  }
  if (missedItems.includes('has_side_income')) {
    medium.push('スキルを活かした副業を月5万円目標で始める');
  }
  if (missedItems.includes('waste_ratio_high')) {
    medium.push('浪費項目を見直して月の浪費を収入の10%以下に抑える');
  }
  medium.push('固定費（保険・通信費）を見直して月1-2万円削減');
  medium.push('投資額を段階的に月3万円まで増額する');

  // 上級（6ヶ月以上の計画）
  if (missedItems.includes('has_stock')) {
    hard.push('配当株・REITでストック収入月5万円を目指す');
  }
  if (missedItems.includes('stock_covers_consumption')) {
    hard.push('ストック収入で生活費を完全にカバーできる資産を築く');
  }
  if (missedItems.includes('side_exceeds_main')) {
    hard.push('副業を本業収入以上に育てて経済的自由を獲得');
  }
  hard.push('総資産1000万円を目指した長期投資戦略を実行');
  hard.push('不動産投資などの大型投資で資産収入を構築');

  return { easy, medium, hard };
}

export function generateDetailedAdvice(data: UserData, missedItems: string[], ratios: ReturnType<typeof calculateRatios>): string[] {
  const advice: string[] = [];
  const totalIncome = data.mainIncome + data.sideIncome + data.stockIncome;

  // 収支バランス改善
  if (missedItems.includes('income_vs_expense')) {
    advice.push('収入と支出のバランスを改善することが最優先です。固定費の見直しから始めましょう。');
  }

  // ストック収入構築
  if (missedItems.includes('has_stock')) {
    advice.push('配当株やREITでストック収入を構築することで、経済的安定性が大幅に向上します。');
  }

  // 投資vs浪費
  if (data.investment <= data.waste) {
    advice.push('浪費を投資に回すことで、将来の資産形成が加速します。優先順位を見直しましょう。');
  }

  // 比率分析アドバイス
  if (ratios.wasteRatio > 20) {
    advice.push(`浪費比率が${ratios.wasteRatio.toFixed(1)}%と高めです。収入の10%以下を目標にしましょう。`);
  }

  if (ratios.investmentToIncomeRatio < 10) {
    advice.push(`投資比率が${ratios.investmentToIncomeRatio.toFixed(1)}%です。収入の20%以上を目標に段階的に増やしましょう。`);
  }

  if (ratios.savingsToExpenseRatio < 300) {
    advice.push('緊急資金として、月間支出の6ヶ月分以上の預金を確保することをお勧めします。');
  }

  // 副業・複数収入源
  if (data.sideIncome === 0) {
    advice.push('収入源を複数持つことでリスクを分散し、経済的安定性を高められます。');
  }

  // 総合的なアドバイス
  if (advice.length === 0) {
    advice.push('現在の資産管理は良好です。さらなる向上のため、長期的な投資戦略を検討しましょう。');
  }

  return advice;
}

