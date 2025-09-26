// src/types/index.ts
// Type definitions for MoneyCheck application
// Defines user input data and scoring structures
// Related: input pages, calculation logic, result components

export interface UserData {
  mainIncome: number
  sideIncome: number
  investment: number
  consumption: number
  waste: number
  bankDeposit: number
  stockIncome: number
  creditCard: number
  subscription: number
}

export interface ScoreResult {
  totalScore: number
  sRankScore: number
  aRankScore: number
  bRankScore: number
  missedItems: string[]
  personalizedAction: string
}

export interface DetailedScoreResult extends ScoreResult {
  breakdown: {
    sRank: { [key: string]: number }
    aRank: { [key: string]: number }
    bRank: { [key: string]: number }
  }
  ratios: {
    wasteRatio: number
    stockToConsumptionRatio: number
    depositToExpenseRatio: number
    investmentToIncomeRatio: number
    subscriptionToIncomeRatio: number
    creditToIncomeRatio: number
  }
  detailedAdvice: string[]
  actionsByDifficulty: {
    easy: string[]
    medium: string[]
    hard: string[]
  }
}

export interface InputPageData {
  title: string
  field: keyof UserData
  placeholder: string
  description: string
  unit: string
  examples?: string[]
}