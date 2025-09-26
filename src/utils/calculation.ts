// src/utils/calculation.ts
// Core calculation logic for MoneyCheck scoring system
// Implements 19-item evaluation with S/A/B rank scoring
// Related: types/index.ts, result pages, input flow

import { UserData, ScoreResult, DetailedScoreResult } from '@/types'

export function calculateScore(data: UserData): ScoreResult {
  const {
    mainIncome,
    sideIncome,
    investment,
    consumption,
    waste,
    bankDeposit,
    stockIncome,
    creditCard,
    subscription
  } = data

  const totalIncome = mainIncome + sideIncome
  const totalExpense = consumption + waste + subscription + creditCard

  let totalScore = 0
  let sRankScore = 0
  let aRankScore = 0
  let bRankScore = 0
  const missedItems: string[] = []

  // S Rank (12 points each, total 48 points)
  if (totalIncome > totalExpense) {
    sRankScore += 12
  } else {
    missedItems.push('income_vs_expense')
  }

  if (stockIncome > 0) {
    sRankScore += 12
  } else {
    missedItems.push('has_stock')
  }

  if (consumption < stockIncome) {
    sRankScore += 12
  } else {
    missedItems.push('consumption_vs_stock')
  }

  if (stockIncome > subscription) {
    sRankScore += 12
  } else {
    missedItems.push('stock_vs_subscription')
  }

  // A Rank (6 points each, total 18 points)
  if (investment > waste) {
    aRankScore += 6
  } else {
    missedItems.push('investment_vs_waste')
  }

  if (bankDeposit > creditCard) {
    aRankScore += 6
  } else {
    missedItems.push('deposit_vs_credit')
  }

  if (investment > 0) {
    aRankScore += 6
  } else {
    missedItems.push('has_investment')
  }

  // B Rank (2 points each, total 34 points)
  if (sideIncome > 0) {
    bRankScore += 2
  } else {
    missedItems.push('has_side_income')
  }

  if (investment > consumption) {
    bRankScore += 2
  } else {
    missedItems.push('investment_vs_consumption')
  }

  if (subscription > 0) {
    bRankScore += 2
  } else {
    missedItems.push('has_subscription')
  }

  if (sideIncome > mainIncome) {
    bRankScore += 2
  } else {
    missedItems.push('side_vs_main_income')
  }

  // Waste ratio
  const wasteRatio = totalIncome > 0 ? (waste / totalIncome) * 100 : 0
  if (wasteRatio <= 10) {
    bRankScore += 2
  } else if (wasteRatio <= 20) {
    bRankScore += 1
  } else {
    missedItems.push('waste_ratio')
  }

  // Stock to consumption ratio
  const stockToConsumptionRatio = consumption > 0 ? (stockIncome / consumption) * 100 : 0
  if (stockToConsumptionRatio >= 100) {
    bRankScore += 2
  } else if (stockToConsumptionRatio >= 50) {
    bRankScore += 1
  } else {
    missedItems.push('stock_consumption_ratio')
  }

  // Deposit to expense ratio
  const depositToExpenseRatio = totalExpense > 0 ? (bankDeposit / totalExpense) * 100 : 0
  if (depositToExpenseRatio >= 600) {
    bRankScore += 2
  } else if (depositToExpenseRatio >= 300) {
    bRankScore += 1
  } else {
    missedItems.push('deposit_expense_ratio')
  }

  // Investment to income ratio
  const investmentToIncomeRatio = totalIncome > 0 ? (investment / totalIncome) * 100 : 0
  if (investmentToIncomeRatio >= 20) {
    bRankScore += 2
  } else if (investmentToIncomeRatio >= 10) {
    bRankScore += 1
  } else {
    missedItems.push('investment_income_ratio')
  }

  // Subscription to income ratio
  const subscriptionToIncomeRatio = totalIncome > 0 ? (subscription / totalIncome) * 100 : 0
  if (subscriptionToIncomeRatio <= 5) {
    bRankScore += 2
  } else if (subscriptionToIncomeRatio <= 10) {
    bRankScore += 1
  } else {
    missedItems.push('subscription_income_ratio')
  }

  // Credit to income ratio
  const creditToIncomeRatio = totalIncome > 0 ? (creditCard / totalIncome) * 100 : 0
  if (creditToIncomeRatio <= 10) {
    bRankScore += 2
  } else if (creditToIncomeRatio <= 30) {
    bRankScore += 1
  } else {
    missedItems.push('credit_income_ratio')
  }

  totalScore = sRankScore + aRankScore + bRankScore

  const personalizedAction = generatePersonalizedAction(data, missedItems)

  return {
    totalScore,
    sRankScore,
    aRankScore,
    bRankScore,
    missedItems,
    personalizedAction
  }
}

export function generatePersonalizedAction(data: UserData, missedItems: string[]): string {
  const {
    mainIncome,
    sideIncome,
    investment,
    consumption,
    waste,
    bankDeposit,
    stockIncome,
    creditCard,
    subscription
  } = data

  const totalIncome = mainIncome + sideIncome
  const totalExpense = consumption + waste + subscription + creditCard

  // Priority: S Rank items first
  if (missedItems.includes('income_vs_expense')) {
    if (totalIncome < totalExpense) {
      const deficit = totalExpense - totalIncome
      return `支出を月${Math.ceil(deficit / 1000)}千円減らすか、収入を増やしましょう`
    }
  }

  if (missedItems.includes('has_stock') && stockIncome === 0) {
    return "配当株や投資信託で月1,000円でもストック収入を作りましょう"
  }

  if (missedItems.includes('consumption_vs_stock')) {
    const needed = consumption - stockIncome
    return `ストック収入を月${Math.ceil(needed / 1000)}千円増やして生活費をカバーしましょう`
  }

  if (missedItems.includes('stock_vs_subscription')) {
    const needed = subscription - stockIncome
    return `サブスクを${Math.ceil(needed / 1000)}千円減らすか、ストック収入を増やしましょう`
  }

  // A Rank items
  if (missedItems.includes('investment_vs_waste')) {
    const needed = waste - investment + 1000
    return `浪費を${Math.ceil(needed / 1000)}千円減らして投資に回しましょう`
  }

  if (missedItems.includes('deposit_vs_credit')) {
    return "クレジットカードの残高を預金残高以下に抑えましょう"
  }

  if (missedItems.includes('has_investment') && investment === 0) {
    return "月1万円でも投資信託を始めてみましょう"
  }

  // B Rank items
  if (missedItems.includes('has_side_income') && sideIncome === 0) {
    return "スキルを活かして月1万円でも副業収入を作りましょう"
  }

  return "家計簿アプリで支出を記録して無駄遣いを見つけましょう"
}

export function getScoreAdvice(score: number): string {
  if (score >= 90) return "素晴らしい！お金の管理が完璧に近いです。"
  if (score >= 80) return "とても良い！少しの改善でさらに向上できます。"
  if (score >= 70) return "良い状態です。いくつかのポイントを改善しましょう。"
  if (score >= 60) return "平均的です。基本的な改善から始めましょう。"
  if (score >= 50) return "改善の余地があります。優先順位を決めて取り組みましょう。"
  if (score >= 40) return "要改善です。まずは支出管理から始めましょう。"
  if (score >= 30) return "危険水域です。家計の見直しが急務です。"
  return "緊急事態です。専門家に相談することをお勧めします。"
}

export function calculateDetailedScore(data: UserData): DetailedScoreResult {
  const basicResult = calculateScore(data)

  const {
    mainIncome,
    sideIncome,
    investment,
    consumption,
    waste,
    bankDeposit,
    stockIncome,
    creditCard,
    subscription
  } = data

  const totalIncome = mainIncome + sideIncome
  const totalExpense = consumption + waste + subscription + creditCard

  // Calculate detailed ratios
  const wasteRatio = totalIncome > 0 ? (waste / totalIncome) * 100 : 0
  const stockToConsumptionRatio = consumption > 0 ? (stockIncome / consumption) * 100 : 0
  const depositToExpenseRatio = totalExpense > 0 ? (bankDeposit / totalExpense) * 100 : 0
  const investmentToIncomeRatio = totalIncome > 0 ? (investment / totalIncome) * 100 : 0
  const subscriptionToIncomeRatio = totalIncome > 0 ? (subscription / totalIncome) * 100 : 0
  const creditToIncomeRatio = totalIncome > 0 ? (creditCard / totalIncome) * 100 : 0

  // Generate detailed advice
  const detailedAdvice = [
    `収支バランス: ${totalIncome > totalExpense ? '黒字' : '赤字'}（月${Math.abs(totalIncome - totalExpense).toLocaleString()}円）`,
    `投資比率: ${investmentToIncomeRatio.toFixed(1)}%（理想20%以上）`,
    `浪費比率: ${wasteRatio.toFixed(1)}%（理想10%以下）`,
    `ストック収入効率: 生活費の${stockToConsumptionRatio.toFixed(1)}%をカバー`
  ]

  // Actions by difficulty
  const actionsByDifficulty = {
    easy: [
      "家計簿アプリで支出を記録する",
      "不要なサブスクを解約する",
      "コンビニでの無駄買いを控える"
    ],
    medium: [
      "副業を始める",
      "つみたてNISAを開始する",
      "固定費を見直す"
    ],
    hard: [
      "転職で収入を増やす",
      "不動産投資を始める",
      "事業を立ち上げる"
    ]
  }

  return {
    ...basicResult,
    breakdown: {
      sRank: {
        "収入>支出": totalIncome > totalExpense ? 12 : 0,
        "ストック収入": stockIncome > 0 ? 12 : 0,
        "生活費<ストック": consumption < stockIncome ? 12 : 0,
        "ストック>サブスク": stockIncome > subscription ? 12 : 0
      },
      aRank: {
        "投資>浪費": investment > waste ? 6 : 0,
        "預金>クレカ": bankDeposit > creditCard ? 6 : 0,
        "投資額": investment > 0 ? 6 : 0
      },
      bRank: {
        "副業収入": sideIncome > 0 ? 2 : 0,
        "投資>消費": investment > consumption ? 2 : 0,
        "サブスク利用": subscription > 0 ? 2 : 0,
        "副業>本業": sideIncome > mainIncome ? 2 : 0
      }
    },
    ratios: {
      wasteRatio,
      stockToConsumptionRatio,
      depositToExpenseRatio,
      investmentToIncomeRatio,
      subscriptionToIncomeRatio,
      creditToIncomeRatio
    },
    detailedAdvice,
    actionsByDifficulty
  }
}