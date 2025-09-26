// src/components/RatioDisplay.tsx
// 各比率詳細表示コンポーネント（6つの重要比率を理想値との比較表示）
// 色分け・進捗バー・改善提案付きで視覚的に分かりやすく表示
// 関連: utils/calculations.ts, components/DetailedScore.tsx, app/premium/result/page.tsx

"use client";

interface RatioDisplayProps {
  ratios: {
    wasteRatio: number;
    stockToConsumptionRatio: number;
    savingsToExpenseRatio: number;
    investmentToIncomeRatio: number;
    subscriptionToIncomeRatio: number;
    creditToIncomeRatio: number;
  };
}

interface RatioThreshold {
  good: number;
  ok: number;
  reverse?: boolean;
  unit?: string;
}

export default function RatioDisplay({ ratios }: RatioDisplayProps) {
  const ratioConfigs: { [key: string]: { label: string; threshold: RatioThreshold; advice: string } } = {
    wasteRatio: {
      label: '浪費比率',
      threshold: { good: 10, ok: 20, reverse: true },
      advice: '収入に占める浪費の割合。10%以下が理想的です。'
    },
    investmentToIncomeRatio: {
      label: '投資比率',
      threshold: { good: 20, ok: 10 },
      advice: '収入に占める投資の割合。20%以上で資産形成が加速します。'
    },
    stockToConsumptionRatio: {
      label: 'ストック効率',
      threshold: { good: 100, ok: 50 },
      advice: 'ストック収入で生活費をカバーする割合。100%以上が目標です。'
    },
    savingsToExpenseRatio: {
      label: '預金余力',
      threshold: { good: 600, ok: 300 },
      advice: '月支出に対する預金の倍率。6ヶ月分以上の確保が安心です。'
    },
    subscriptionToIncomeRatio: {
      label: 'サブスク比率',
      threshold: { good: 5, ok: 10, reverse: true },
      advice: '収入に占めるサブスクの割合。5%以下に抑えることが重要です。'
    },
    creditToIncomeRatio: {
      label: 'クレカ比率',
      threshold: { good: 10, ok: 30, reverse: true },
      advice: '収入に占めるクレカ支払いの割合。10%以下が安全圏です。'
    }
  };

  const getRatioColor = (value: number, threshold: RatioThreshold): string => {
    if (threshold.reverse) {
      if (value <= threshold.good) return 'text-green-400';
      if (value <= threshold.ok) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= threshold.good) return 'text-green-400';
      if (value >= threshold.ok) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const getRatioBgColor = (value: number, threshold: RatioThreshold): string => {
    if (threshold.reverse) {
      if (value <= threshold.good) return 'bg-green-500/20';
      if (value <= threshold.ok) return 'bg-yellow-500/20';
      return 'bg-red-500/20';
    } else {
      if (value >= threshold.good) return 'bg-green-500/20';
      if (value >= threshold.ok) return 'bg-yellow-500/20';
      return 'bg-red-500/20';
    }
  };

  const getProgressPercentage = (value: number, threshold: RatioThreshold): number => {
    if (threshold.reverse) {
      const max = threshold.ok * 2; // 表示用の最大値
      return Math.min((max - value) / max * 100, 100);
    } else {
      const max = Math.max(threshold.good * 1.5, value * 1.2); // 動的最大値
      return Math.min(value / max * 100, 100);
    }
  };

  const getRatioStatus = (value: number, threshold: RatioThreshold): string => {
    if (threshold.reverse) {
      if (value <= threshold.good) return '優秀';
      if (value <= threshold.ok) return '改善要';
      return '要注意';
    } else {
      if (value >= threshold.good) return '優秀';
      if (value >= threshold.ok) return '良好';
      return '改善要';
    }
  };

  const RatioCard = ({ value, config }: { value: number, config: { label: string; threshold: RatioThreshold; advice: string } }) => (
    <div className={`p-6 rounded-xl border ${getRatioBgColor(value, config.threshold)}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-200">{config.label}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          getRatioStatus(value, config.threshold) === '優秀' ? 'bg-green-500/20 text-green-400' :
          getRatioStatus(value, config.threshold) === '良好' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {getRatioStatus(value, config.threshold)}
        </span>
      </div>

      <div className="mb-4">
        <div className={`text-3xl font-bold ${getRatioColor(value, config.threshold)}`}>
          {value.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400 mt-1">
          理想: {config.threshold.reverse ? `${config.threshold.good}%以下` : `${config.threshold.good}%以上`}
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              getRatioColor(value, config.threshold).replace('text-', 'bg-').replace('-400', '-500')
            }`}
            style={{ width: `${getProgressPercentage(value, config.threshold)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        {config.advice}
      </p>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        📊 重要比率分析
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Object.entries(ratioConfigs).map(([key, config]) => (
          <RatioCard
            key={key}
            value={ratios[key as keyof typeof ratios]}
            config={config}
          />
        ))}
      </div>

      {/* 比率改善のポイント */}
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          💡 比率改善のポイント
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <strong className="text-green-400">投資比率UP:</strong> つみたてNISAで月3万円から開始
          </div>
          <div>
            <strong className="text-red-400">浪費比率DOWN:</strong> 固定費見直しで月1-2万円削減
          </div>
          <div>
            <strong className="text-blue-400">ストック効率UP:</strong> 配当株・REITで不労所得確保
          </div>
          <div>
            <strong className="text-yellow-400">預金余力UP:</strong> 緊急時資金6ヶ月分を目標
          </div>
        </div>
      </div>
    </div>
  );
}