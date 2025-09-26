// src/components/ScoreDisplay.tsx
// 総合スコア表示コンポーネント（100点満点の大きな表示）
// ランク表示とアニメーション効果付きスコア表示
// 関連: utils/calculations.ts, components/AdviceCard.tsx, app/result/page.tsx

"use client";

import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  totalScore: number;
  rank: string;
}

export default function ScoreDisplay({ totalScore, rank }: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500; // 1.5秒でアニメーション
    const steps = 60;
    const increment = totalScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalScore) {
        setAnimatedScore(totalScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalScore]);

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-orange-500';
      case 'D': return 'text-red-500';
      default: return 'text-muted';
    }
  };

  const getRankDescription = (rank: string): string => {
    switch (rank) {
      case 'S': return '優秀';
      case 'A': return '良好';
      case 'B': return 'まずまず';
      case 'C': return '平均的';
      case 'D': return '要改善';
      default: return '';
    }
  };

  return (
    <div className="text-center mb-8">
      <div className="inline-flex flex-col items-center bg-secondary rounded-2xl p-8 shadow-lg">
        <div className="flex items-end gap-2 mb-4">
          <span className="text-6xl font-bold text-foreground">
            {animatedScore}
          </span>
          <span className="text-2xl text-muted mb-2">/ 100点</span>
          <span className={`text-3xl font-bold ${getRankColor(rank)} mb-2`}>
            {rank}ランク
          </span>
        </div>
        <p className="text-lg text-muted">
          {getRankDescription(rank)}
        </p>
      </div>
    </div>
  );
}