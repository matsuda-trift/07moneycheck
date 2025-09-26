// src/components/DetailedScore.tsx
// 詳細スコア内訳表示コンポーネント（S/A/Bランク別項目表示）
// 達成・未達成の視覚的区別とチェックマーク・改善提案表示
// 関連: utils/calculations.ts, app/premium/result/page.tsx, components/RatioDisplay.tsx

"use client";

interface DetailedScoreProps {
  sRankDetails: { [key: string]: number };
  aRankDetails: { [key: string]: number };
  bRankDetails: { [key: string]: number };
  sRankScore: number;
  aRankScore: number;
  bRankScore: number;
}

export default function DetailedScore({
  sRankDetails,
  aRankDetails,
  bRankDetails,
  sRankScore,
  aRankScore,
  bRankScore
}: DetailedScoreProps) {
  const getScoreColor = (score: number, maxScore: number): string => {
    if (score === maxScore) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number, maxScore: number): string => {
    if (score === maxScore) return '✅';
    if (score > 0) return '⚠️';
    return '❌';
  };

  const ScoreItem = ({
    title,
    score,
    maxScore,
    description
  }: {
    title: string;
    score: number;
    maxScore: number;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-lg">{getScoreIcon(score, maxScore)}</span>
        <div>
          <span className="text-gray-200 font-medium">{title}</span>
          {description && (
            <div className="text-xs text-gray-400 mt-1">{description}</div>
          )}
        </div>
      </div>
      <span className={`font-bold ${getScoreColor(score, maxScore)}`}>
        {score}/{maxScore}点
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sランク項目 */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-blue-300">
            Sランク（最重要）
          </h3>
          <div className="text-2xl font-bold text-blue-300">
            {sRankScore}/48点
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(sRankDetails).map(([key, score]) => (
            <ScoreItem
              key={key}
              title={key}
              score={score}
              maxScore={12}
              description={getSRankDescription(key)}
            />
          ))}
        </div>
      </div>

      {/* Aランク項目 */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-green-300">
            Aランク（重要）
          </h3>
          <div className="text-2xl font-bold text-green-300">
            {aRankScore}/18点
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(aRankDetails).map(([key, score]) => (
            <ScoreItem
              key={key}
              title={key}
              score={score}
              maxScore={6}
              description={getARankDescription(key)}
            />
          ))}
        </div>
      </div>

      {/* Bランク項目 */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-yellow-300">
            Bランク（効率化）
          </h3>
          <div className="text-2xl font-bold text-yellow-300">
            {bRankScore}/34点
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(bRankDetails).map(([key, score]) => (
            <ScoreItem
              key={key}
              title={key}
              score={score}
              maxScore={2}
              description={getBRankDescription(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getSRankDescription(key: string): string {
  switch (key) {
    case '収入vs支出': return '基本的な黒字体質';
    case 'ストック収入': return '不労所得の確保';
    case 'ストック収入vs消費': return '生活費の自動化';
    case 'ストック収入vsサブスク': return 'サブスクの自動化';
    default: return '';
  }
}

function getARankDescription(key: string): string {
  switch (key) {
    case '投資vs浪費': return '優先順位の適正化';
    case '預金vsクレカ': return '安全性の確保';
    case '投資実行': return '資産形成の開始';
    default: return '';
  }
}

function getBRankDescription(key: string): string {
  switch (key) {
    case '副業収入': return '収入源の多様化';
    case '投資vs消費': return '投資優先の思考';
    case 'サブスク利用': return '定期サービス活用';
    case '副業優位': return '副業の本格化';
    case '浪費比率': return '10%以下が理想';
    case 'ストック/消費比率': return '100%以上が目標';
    case '預金/支出比率': return '6ヶ月分以上';
    case '投資/収入比率': return '20%以上推奨';
    case 'サブスク/収入比率': return '5%以下が適正';
    case 'クレカ/収入比率': return '10%以下が安全';
    default: return '';
  }
}