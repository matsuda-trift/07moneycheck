// src/components/ShareButtons.tsx
// SNSシェアボタンコンポーネント
// 画像生成とテキストシェア機能を統合
// 関連ファイル: imageGenerator.ts, result/page.tsx, premium/result/page.tsx

'use client'

import { useState } from 'react'
import { generateShareImage, generateShareText } from '@/utils/imageGenerator'

interface ShareButtonsProps {
  score: number
  rank: string
  action: string
  isPremium?: boolean
  className?: string
}

export default function ShareButtons({
  score,
  rank,
  action,
  isPremium = false,
  className = ''
}: ShareButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')

  const shareText = generateShareText(score, rank, action, isPremium)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://moneycheck.app'

  const handleTextShare = async () => {
    const fullText = shareText + `\n\n${baseUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MoneyCheck 診断結果',
          text: shareText,
          url: baseUrl
        })
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error)
          copyToClipboard(fullText)
        }
      }
    } else {
      copyToClipboard(fullText)
    }
  }

  const handleImageShare = async (format: 'square' | 'landscape' = 'square') => {
    try {
      setIsGenerating(true)
      const imageUrl = await generateShareImage(score, rank, action, format, isPremium)
      setGeneratedImage(imageUrl)
      setShowImagePreview(true)

      // 画像をダウンロード
      const link = document.createElement('a')
      link.download = `moneycheck-result-${score}点.png`
      link.href = imageUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error('Image generation failed:', error)
      alert('画像の生成に失敗しました。テキストでシェアしてください。')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(baseUrl)}&hashtags=MoneyCheck,資産診断`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleLineShare = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n\n' + baseUrl)}`
    window.open(lineUrl, '_blank')
  }

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        alert('結果をクリップボードにコピーしました！')
      } catch (error) {
        console.error('Clipboard copy failed:', error)
        fallbackCopyToClipboard(text)
      }
    } else {
      fallbackCopyToClipboard(text)
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert('結果をクリップボードにコピーしました！')
    } catch (error) {
      console.error('Fallback copy failed:', error)
      alert('コピーに失敗しました。手動でテキストを選択してコピーしてください。')
    } finally {
      document.body.removeChild(textArea)
    }
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* シェアボタン */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center space-x-2 bg-[#1da1f2] hover:bg-[#1a8cd8] text-white py-3 px-6 rounded-lg transition-colors"
          >
            <span>𝕏</span>
            <span>Twitter</span>
          </button>

          <button
            onClick={handleLineShare}
            className="flex items-center justify-center space-x-2 bg-[#00b900] hover:bg-[#009900] text-white py-3 px-6 rounded-lg transition-colors"
          >
            <span>💬</span>
            <span>LINE</span>
          </button>

          <button
            onClick={handleTextShare}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            <span>📱</span>
            <span>結果をシェア</span>
          </button>
        </div>

        {/* プライバシー注意書き */}
        <div className="text-xs text-gray-500 text-center">
          💡 個人の金額情報は含まれません。スコアとアドバイスのみシェアされます。
        </div>
      </div>

      {/* 画像プレビューモーダル */}
      {showImagePreview && generatedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">生成された画像</h3>
            </div>
            <div className="p-4">
              <img
                src={generatedImage}
                alt="MoneyCheck診断結果画像"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setShowImagePreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                閉じる
              </button>
              <a
                href={generatedImage}
                download={`moneycheck-result-${score}点.png`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ダウンロード
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}