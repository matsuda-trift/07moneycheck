// src/components/ProgressBar.tsx
// プログレスバーコンポーネント（9ステップの進捗表示）
// 入力フォームの現在位置と進捗パーセンテージを視覚化
// 関連: app/input/page.tsx, contexts/DataContext.tsx, types/moneycheck.ts

import { memo } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted">
          質問 {currentStep} / {totalSteps}
        </span>
        <span className="text-sm text-muted">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`診断の進捗: ${progress}%完了`}>
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default memo(ProgressBar);