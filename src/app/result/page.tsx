// src/app/result/page.tsx
// 無料版結果表示ページ（総合スコア・アドバイス・パーソナライズドアクション）
// プレミアム版誘導とシェア機能を含む結果表示画面
// 関連: utils/calculations.ts, components/ScoreDisplay.tsx, contexts/DataContext.tsx

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { ScoreResult } from '@/types/moneycheck';
import { calculateMoneyScore } from '@/utils/calculations';
import ScoreDisplay from '@/components/ScoreDisplay';
import AdviceCard from '@/components/AdviceCard';
import ActionCard from '@/components/ActionCard';
import ShareButtons from '@/components/ShareButtons';

export default function ResultPage() {
  const router = useRouter();
  const { userData, clearUserData } = useData();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 入力データの検証
    const hasValidData = Object.values(userData).every(value =>
      typeof value === 'number' && !isNaN(value) && value >= 0
    );

    // すべて0の場合は診断不可
    const hasAnyNonZeroValue = Object.values(userData).some(value => value > 0);

    if (!hasValidData || !hasAnyNonZeroValue) {
      router.push('/?error=no-data');
      return;
    }

    // スコア計算
    const scoreResult = calculateMoneyScore(userData);
    setResult(scoreResult);
    setLoading(false);
  }, [userData, router]);

  const handleRetry = () => {
    clearUserData();
    router.push('/input');
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">診断結果を計算中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            MoneyCheck 診断結果
          </h1>
          <p className="text-muted">あなたの資産状況を分析しました</p>
        </div>

        {/* Score Display */}
        <ScoreDisplay totalScore={result.totalScore} rank={result.rank} />

        {/* Advice Card */}
        <AdviceCard totalScore={result.totalScore} feedback={result.feedback} />

        {/* Action Card */}
        <ActionCard personalizedAction={result.personalizedAction} />

        {/* Score Breakdown */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">スコア内訳</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {result.sRankScore}
              </div>
              <div className="text-sm text-muted">
                Sランク (48点満点)
              </div>
              <div className="text-xs text-muted mt-1">
                基本的な資産管理
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {result.aRankScore}
              </div>
              <div className="text-sm text-muted">
                Aランク (18点満点)
              </div>
              <div className="text-xs text-muted mt-1">
                投資・預金管理
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {result.bRankScore}
              </div>
              <div className="text-sm text-muted">
                Bランク (34点満点)
              </div>
              <div className="text-xs text-muted mt-1">
                効率性・比率管理
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            🚀 結果をシェアしよう
          </h3>
          <ShareButtons
            score={result.totalScore}
            rank={result.rank}
            action={result.personalizedAction}
            isPremium={false}
          />
        </div>

        {/* Premium Upgrade */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔥 詳細分析を見る（有料版）
          </h2>
          <p className="text-muted mb-4">
            各項目の詳細スコア、具体的な比率分析、実行難易度別のアクションプランを提供
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/premium"
              className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors"
            >
              詳細分析を見る（500円）
            </Link>
            <div className="text-sm text-muted">
              ✓ 19項目の詳細スコア内訳<br />
              ✓ 6つの重要比率分析<br />
              ✓ 実行レベル別アクションプラン
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleRetry}
            className="border border-border text-foreground py-3 px-6 rounded-lg hover:bg-secondary transition-colors"
          >
            もう一度診断する
          </button>

          <Link
            href="/"
            className="bg-secondary text-foreground py-3 px-6 rounded-lg text-center hover:bg-border transition-colors"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}