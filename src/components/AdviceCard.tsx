// src/components/AdviceCard.tsx
// アドバイスカードコンポーネント（10点刻みのアドバイス表示）
// スコア範囲に応じた具体的なアドバイス文言
// 関連: utils/calculations.ts, components/ScoreDisplay.tsx, app/result/page.tsx

interface AdviceCardProps {
  totalScore: number;
  feedback: string;
}

export default function AdviceCard({ totalScore, feedback }: AdviceCardProps) {
  const getDetailedAdvice = (score: number): string => {
    if (score >= 90) {
      return "資産管理のプロフェッショナル！このまま継続して、さらなる資産増加を目指しましょう。";
    } else if (score >= 80) {
      return "かなり優秀な資産管理ができています。細部を調整すればさらに向上できます。";
    } else if (score >= 70) {
      return "良好な資産管理です。重点的な改善でより理想的な状態に近づけます。";
    } else if (score >= 60) {
      return "平均的な資産管理です。基本的な改善から始めて着実に向上させましょう。";
    } else if (score >= 50) {
      return "改善の余地があります。収支バランスと投資習慣の見直しをおすすめします。";
    } else if (score >= 40) {
      return "要改善の状態です。支出管理と収入増加の両方を検討しましょう。";
    } else if (score >= 30) {
      return "危険水域です。家計の根本的な見直しが必要です。";
    } else if (score >= 20) {
      return "緊急改善が必要です。支出の大幅削減と収入源の確保を最優先に。";
    } else if (score >= 10) {
      return "破綻寸前の状態です。今すぐ専門家に相談することをおすすめします。";
    } else {
      return "即座に専門家相談を！ファイナンシャルプランナーに相談してください。";
    }
  };

  const getScoreIcon = (score: number): string => {
    if (score >= 80) return "🎉";
    if (score >= 60) return "👍";
    if (score >= 40) return "📈";
    if (score >= 20) return "⚠️";
    return "🚨";
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">
          {getScoreIcon(totalScore)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            あなたの資産状況について
          </h3>
          <p className="text-muted mb-4">
            {feedback}
          </p>
          <p className="text-sm text-muted">
            {getDetailedAdvice(totalScore)}
          </p>
        </div>
      </div>
    </div>
  );
}