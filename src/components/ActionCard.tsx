// src/components/ActionCard.tsx
// パーソナライズドアクションカードコンポーネント
// 具体的で実行しやすいアクション提案の表示
// 関連: utils/calculations.ts, components/AdviceCard.tsx, app/result/page.tsx

interface ActionCardProps {
  personalizedAction: string;
}

export default function ActionCard({ personalizedAction }: ActionCardProps) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-2xl">🎯</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            あなたの改善アクション
          </h3>
          <p className="text-foreground font-medium mb-2">
            {personalizedAction}
          </p>
          <p className="text-sm text-muted">
            最も効果的な改善策を1つ提案しています。まずはここから始めてみましょう。
          </p>
        </div>
      </div>
    </div>
  );
}