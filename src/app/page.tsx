// src/app/page.tsx
// MoneyCheck home page with introduction and start button
// Landing page for the asset evaluation tool
// Related: input/page.tsx, layout.tsx, result pages

"use client";

import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { clearUserData } = useData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no-data') {
      setErrorMessage('診断を行うためには、収入・支出・資産のいずれかに金額を入力してください。');
    }
  }, [searchParams]);

  const handleStartDiagnosis = () => {
    clearUserData(); // 前回のセッションデータをクリア
    setErrorMessage(''); // エラーメッセージをクリア
    router.push('/input');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Money<span className="text-blue-300">Check</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            男子大学生向け資産診断ツール
          </p>

          <p className="text-lg mb-12 leading-relaxed text-gray-200">
            あなたの収入・支出・投資状況を9つの質問で分析し、<br />
            <strong className="text-blue-300">100点満点</strong>でスコア化します。
          </p>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">診断内容</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">収入分析</h3>
                <p className="text-sm text-gray-300">本業・副業・ストック収入を評価</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">支出管理</h3>
                <p className="text-sm text-gray-300">消費・浪費・サブスクを分析</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">資産状況</h3>
                <p className="text-sm text-gray-300">預金・投資・クレカ残高をチェック</p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <p className="text-red-200 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleStartDiagnosis}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all transform hover:scale-105 cursor-pointer"
            >
              診断を始める（無料）
            </button>
            <p className="text-sm text-gray-400">
              所要時間：約3分 | データは保存されません
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
