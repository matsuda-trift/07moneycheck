// src/app/premium/result/page.tsx
// 有料版詳細結果表示画面（S/A/B別スコア内訳・比率詳細・実行難易度別アクション）
// 決済完了後のアクセス制御と19項目詳細分析を表示
// 関連: utils/calculations.ts, contexts/DataContext.tsx, components/DetailedScore.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserData } from '@/types/moneycheck'
import { DetailedScoreResult, calculateDetailedMoneyScore } from '@/utils/calculations'
import { useData } from '@/contexts/DataContext'
import DetailedScore from '@/components/DetailedScore'
import RatioDisplay from '@/components/RatioDisplay'
import ActionsByDifficulty from '@/components/ActionsByDifficulty'
import ShareButtons from '@/components/ShareButtons'

export default function PremiumResultPage() {
  const router = useRouter()
  const { clearUserData } = useData()
  const [result, setResult] = useState<DetailedScoreResult | null>(null)
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // URLからsession_idパラメータを取得
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')

    const savedData = localStorage.getItem('moneycheck-session')

    // Stripe決済完了の場合
    if (sessionId) {
      // データ存在チェック - 決済完了時はセッションメタデータから復元
      if (!savedData) {
        // セッションメタデータからスコア情報を取得してデータを復元
        fetch(`/api/create-checkout-session?session_id=${sessionId}`)
          .then(response => response.json())
          .then(sessionData => {
            if (sessionData.payment_status === 'paid' && sessionData.metadata) {
              // メタデータから基本情報を復元（簡易版）
              const restoredData = {
                mainIncome: 0,
                sideIncome: 0,
                investment: 0,
                consumption: 0,
                waste: 0,
                savings: 0,
                stockIncome: 0,
                creditPayment: 0,
                subscription: 0,
                totalScore: parseInt(sessionData.metadata.totalScore),
                rank: sessionData.metadata.rank
              }

              // プレミアムアクセス権を付与（24時間有効）
              const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
              localStorage.setItem('moneyCheckPremium', 'true')
              localStorage.setItem('moneyCheckPremiumExpiry', expiryTime.toString())
              localStorage.removeItem('moneyCheckPending')

              // エラーメッセージを表示
              alert('決済は完了しましたが、診断データが見つかりません。再度診断を行ってください。')
              router.push('/input')
              return
            } else {
              console.error('Payment not completed:', sessionData)
              router.push('/premium')
              return
            }
          })
          .catch(error => {
            console.error('Session validation error:', error)
            router.push('/premium')
            return
          })
        return
      }
      // データが存在する場合のセッション検証
      fetch(`/api/create-checkout-session?session_id=${sessionId}`)
        .then(response => response.json())
        .then(sessionData => {
          if (sessionData.payment_status === 'paid') {
            // プレミアムアクセス権を付与（24時間有効）
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
            localStorage.setItem('moneyCheckPremium', 'true')
            localStorage.setItem('moneyCheckPremiumExpiry', expiryTime.toString())
            // 決済待ち状態をクリア
            localStorage.removeItem('moneyCheckPending')
          } else {
            console.error('Payment not completed:', sessionData)
            router.push('/premium')
            return
          }
        })
        .catch(error => {
          console.error('Session validation error:', error)
          router.push('/premium')
          return
        })
    } else {
      // データ存在チェック（通常アクセス時のみ）
      if (!savedData) {
        router.push('/input')
        return
      }
      // 通常のアクセス - プレミアム権限チェック
      const hasPremium = localStorage.getItem('moneyCheckPremium')
      const premiumExpiry = localStorage.getItem('moneyCheckPremiumExpiry')

      if (!hasPremium) {
        router.push('/premium')
        return
      }

      // プレミアム有効期限チェック（24時間）
      if (premiumExpiry) {
        const expiryTime = parseInt(premiumExpiry)
        const currentTime = Date.now()

        if (currentTime > expiryTime) {
          localStorage.removeItem('moneyCheckPremium')
          localStorage.removeItem('moneyCheckPremiumExpiry')
          router.push('/premium')
          return
        }
      } else {
        // 有効期限が設定されていない場合は有効期限切れとみなす
        localStorage.removeItem('moneyCheckPremium')
        router.push('/premium')
        return
      }
    }

    try {
      const userData: UserData = JSON.parse(savedData)
      const detailedResult = calculateDetailedMoneyScore(userData)

      setData(userData)
      setResult(detailedResult)
    } catch (error) {
      console.error('データの解析に失敗しました:', error)
      router.push('/input')
      return
    }

    setLoading(false)
  }, [router])

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRatioColor = (ratio: number, thresholds: { good: number, ok: number, reverse?: boolean }) => {
    if (thresholds.reverse) {
      if (ratio <= thresholds.good) return 'text-green-400'
      if (ratio <= thresholds.ok) return 'text-yellow-400'
      return 'text-red-400'
    } else {
      if (ratio >= thresholds.good) return 'text-green-400'
      if (ratio >= thresholds.ok) return 'text-yellow-400'
      return 'text-red-400'
    }
  }

  const handleShare = () => {
    if (!result || !data) return

    const shareText = `MoneyCheck詳細分析結果！\n\n総合スコア: ${result.totalScore}/100点\nS級: ${result.sRankScore}/48点\nA級: ${result.aRankScore}/18点\nB級: ${result.bRankScore}/34点\n\n投資比率: ${result.ratios.investmentToIncomeRatio.toFixed(1)}%\n浪費比率: ${result.ratios.wasteRatio.toFixed(1)}%\n\n#MoneyCheck #資産診断 #詳細分析`

    if (navigator.share) {
      navigator.share({
        title: 'MoneyCheck 詳細分析結果',
        text: shareText,
        url: window.location.origin
      })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText + `\n\n${window.location.origin}`)
      alert('詳細結果をクリップボードにコピーしました！')
    }
  }

  if (loading || !result || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>詳細分析を生成中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-yellow-600 text-black px-4 py-2 rounded-full font-bold mb-4">
              <span>🔥</span>
              <span>プレミアム詳細分析</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              完全分析レポート
            </h1>
            <p className="text-gray-300">19項目の詳細評価と改善戦略</p>
          </div>

          {/* Executive Summary */}
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
              総合評価: <span className={getScoreColor(result.totalScore, 100)}>{result.totalScore}点</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(result.sRankScore, 48)}`}>
                  {result.sRankScore}/48
                </div>
                <div className="text-lg text-blue-300 font-semibold">Sランク</div>
                <div className="text-sm text-gray-400">基本的な資産管理</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(result.aRankScore, 18)}`}>
                  {result.aRankScore}/18
                </div>
                <div className="text-lg text-green-300 font-semibold">Aランク</div>
                <div className="text-sm text-gray-400">投資・預金管理</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(result.bRankScore, 34)}`}>
                  {result.bRankScore}/34
                </div>
                <div className="text-lg text-yellow-300 font-semibold">Bランク</div>
                <div className="text-sm text-gray-400">効率性・比率管理</div>
              </div>
            </div>
          </div>

          {/* Detailed Score Breakdown */}
          <div className="mb-8">
            <DetailedScore
              sRankDetails={result.sRankDetails}
              aRankDetails={result.aRankDetails}
              bRankDetails={result.bRankDetails}
              sRankScore={result.sRankScore}
              aRankScore={result.aRankScore}
              bRankScore={result.bRankScore}
            />
          </div>

          {/* Key Ratios Analysis */}
          <div className="mb-8">
            <RatioDisplay ratios={result.ratios} />
          </div>

          {/* Action Plans by Difficulty */}
          <div className="mb-8">
            <ActionsByDifficulty actionsByDifficulty={result.actionsByDifficulty} />
          </div>

          {/* Detailed Advice */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              💡 専門アドバイス
            </h2>
            <div className="space-y-4">
              {result.detailedAdvice.map((advice, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-gray-200">{advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-300">
              🚀 詳細分析をシェアしよう
            </h2>
            <ShareButtons
              score={result.totalScore}
              rank={result.rank}
              action={result.actionsByDifficulty.easy[0] || '家計簿アプリで支出を記録する'}
              isPremium={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                clearUserData() // DataContextを使用してデータをクリア
                localStorage.removeItem('moneyCheckPremium')
                router.push('/input')
              }}
              className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors"
            >
              再診断する
            </button>

            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              トップに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}