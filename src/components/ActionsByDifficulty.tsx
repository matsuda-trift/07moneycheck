// src/components/ActionsByDifficulty.tsx
// 実行難易度別アクションプラン表示コンポーネント（簡単・普通・難しい）
// アイコン+色分け+期限表示で実行しやすさを視覚的に表現
// 関連: utils/calculations.ts, app/premium/result/page.tsx, components/DetailedScore.tsx

"use client";

interface ActionsByDifficultyProps {
  actionsByDifficulty: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

export default function ActionsByDifficulty({ actionsByDifficulty }: ActionsByDifficultyProps) {
  const difficultyConfigs = {
    easy: {
      title: '簡単（今すぐできる）',
      icon: '🟢',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-300',
      period: '今日から',
      description: 'すぐに実行できる基本的な改善'
    },
    medium: {
      title: '中級（1-3ヶ月で実行）',
      icon: '🟡',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-300',
      period: '3ヶ月以内',
      description: '計画的に取り組む中期的な改善'
    },
    hard: {
      title: '上級（6ヶ月以上の計画）',
      icon: '🔴',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-300',
      period: '6ヶ月〜',
      description: '長期的に取り組む資産形成戦略'
    }
  };

  const ActionCard = ({
    actions,
    config,
    level
  }: {
    actions: string[],
    config: typeof difficultyConfigs.easy,
    level: string
  }) => (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-6 h-full`}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{config.icon}</span>
          <h3 className={`text-lg font-bold ${config.textColor}`}>
            {config.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
            実行期限: {config.period}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {config.description}
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className={`w-6 h-6 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className="text-xs font-bold text-gray-300">{index + 1}</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              {action}
            </p>
          </div>
        ))}
      </div>

      {/* 難易度別のヒント */}
      <div className="mt-6 p-3 bg-white/5 rounded-lg">
        <h4 className={`text-sm font-semibold ${config.textColor} mb-2`}>
          💡 実行のコツ
        </h4>
        <p className="text-xs text-gray-400">
          {level === 'easy' && '小さな変化から始めて習慣化を目指しましょう。完璧を求めずに継続することが重要です。'}
          {level === 'medium' && '月単位で目標を設定し、進捗を記録しながら着実に実行しましょう。'}
          {level === 'hard' && '長期的な視点で計画を立て、定期的に見直しながら大きな目標に向けて進みましょう。'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎯 実行難易度別アクションプラン
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ActionCard
          actions={actionsByDifficulty.easy}
          config={difficultyConfigs.easy}
          level="easy"
        />
        <ActionCard
          actions={actionsByDifficulty.medium}
          config={difficultyConfigs.medium}
          level="medium"
        />
        <ActionCard
          actions={actionsByDifficulty.hard}
          config={difficultyConfigs.hard}
          level="hard"
        />
      </div>

      {/* 実行戦略のガイダンス */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          🚀 効果的な実行戦略
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">1. 簡単なアクションから開始</h4>
            <p className="text-gray-300">
              まずは今日からできることを実行し、成功体験を積み重ねましょう。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">2. 中級アクションで習慣化</h4>
            <p className="text-gray-300">
              1-3ヶ月かけて取り組む項目で、資産管理の基盤を構築します。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">3. 上級アクションで飛躍</h4>
            <p className="text-gray-300">
              長期的な視点で大きな目標に挑戦し、経済的自由を目指します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}