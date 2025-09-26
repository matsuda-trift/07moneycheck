// src/app/premium/page.tsx
// 有料版（500円）決済ページ - Stripe Checkout Session使用
// 決済完了後は有料版結果画面にリダイレクト
// 関連: api/create-checkout-session/route.ts, premium/result/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { calculateMoneyScore } from '@/utils/calculations'

export default function PremiumPage() {
  const router = useRouter()
  const { userData } = useData()
  const [result, setResult] = useState<ReturnType<typeof calculateMoneyScore> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // 入力データの検証
    const hasValidData = Object.values(userData).every(value =>
      typeof value === 'number' && !isNaN(value) && value >= 0
    );

    // すべて0の場合は診断不可
    const hasAnyNonZeroValue = Object.values(userData).some(value => value > 0);

    if (!hasValidData || !hasAnyNonZeroValue) {
      router.push('/?error=no-data')
      return
    }

    // スコア計算
    const scoreResult = calculateMoneyScore(userData)
    setResult(scoreResult)
  }, [userData, router])

  const handlePayment = async () => {
    if (!result) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalScore: result.totalScore,
          rank: result.rank,
        }),
      })

      if (!response.ok) {
        throw new Error('決済セッションの作成に失敗しました')
      }

      const { url } = await response.json()

      // 決済データを保存（決済完了後の確認用）
      localStorage.setItem('moneyCheckPending', 'true')

      // Stripe Checkoutにリダイレクト
      window.location.href = url

    } catch (error) {
      console.error('Payment error:', error)
      setError('決済処理でエラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-yellow-600 text-black px-4 py-2 rounded-full font-bold mb-4">
              <span>🔥</span>
              <span>プレミアム詳細分析</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              完全分析レポートを取得
            </h1>
            <p className="text-gray-300">19項目の詳細評価と改善戦略</p>
          </div>

          {/* Current Score Preview */}
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">あなたの現在のスコア</h2>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-yellow-400 mb-2">{result.totalScore}点</div>
              <div className="text-xl text-gray-300">{result.rank}ランク</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <p className="text-lg">{result.personalizedAction}</p>
            </div>
          </div>

          {/* Premium Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">🎯 詳細スコア内訳</h3>
              <ul className="space-y-2 text-gray-200">
                <li>✓ Sランク: 48点中の詳細項目</li>
                <li>✓ Aランク: 18点中の詳細項目</li>
                <li>✓ Bランク: 34点中の詳細項目</li>
                <li>✓ 各項目の達成・未達成状況</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">📊 6つの重要比率分析</h3>
              <ul className="space-y-2 text-gray-200">
                <li>✓ 浪費比率の詳細分析</li>
                <li>✓ 投資/収入比率の最適化提案</li>
                <li>✓ ストック/消費比率の改善案</li>
                <li>✓ 理想値との比較と目標設定</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">🚀 実行レベル別アクション</h3>
              <ul className="space-y-2 text-gray-200">
                <li>✓ 簡単（今すぐできる）: 5-7項目</li>
                <li>✓ 普通（1-3ヶ月）: 5項目</li>
                <li>✓ 難しい（6ヶ月以上）: 5項目</li>
                <li>✓ 実行優先順位の明確化</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">💡 専門アドバイス</h3>
              <ul className="space-y-2 text-gray-200">
                <li>✓ 個別状況に応じた改善提案</li>
                <li>✓ 長期的な資産形成戦略</li>
                <li>✓ リスク管理のアドバイス</li>
                <li>✓ 詳細結果の画像シェア機能</li>
              </ul>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4">完全分析レポート</h2>
              <div className="text-6xl font-bold text-black mb-2">¥500</div>
              <p className="text-black/80 mb-6">一回限りの買い切り • データ保存なし • 24時間アクセス</p>

              <div className="flex justify-center mb-6">
                <div className="bg-black/20 rounded-lg p-4 text-black">
                  <div className="flex items-center space-x-4 text-sm">
                    <span>✓ クレジットカード</span>
                    <span>✓ PayPay</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-black text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '処理中...' : '詳細分析を取得する'}
              </button>

              <p className="text-black/60 text-xs mt-4">
                決済完了後、即座に詳細分析画面が表示されます
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/result"
              className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors"
            >
              無料版に戻る
            </Link>

            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}