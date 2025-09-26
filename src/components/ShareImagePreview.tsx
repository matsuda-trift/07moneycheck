// src/components/ShareImagePreview.tsx
// シェア画像プレビューコンポーネント
// 生成された画像の確認とダウンロード機能
// 関連ファイル: ShareButtons.tsx, imageGenerator.ts

'use client'

interface ShareImagePreviewProps {
  imageUrl: string
  isVisible: boolean
  onClose: () => void
  score: number
}

export default function ShareImagePreview({
  imageUrl,
  isVisible,
  onClose,
  score
}: ShareImagePreviewProps) {
  if (!isVisible || !imageUrl) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `moneycheck-result-${score}点.png`
    link.href = imageUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              生成された画像
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4">
          <img
            src={imageUrl}
            alt="MoneyCheck診断結果画像"
            className="max-w-full h-auto rounded-lg shadow-sm"
          />

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 この画像をSNSでシェアして友人と結果を共有できます</p>
            <p>📱 スマートフォンの場合は長押しで保存も可能です</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors order-2 sm:order-1"
          >
            閉じる
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors order-1 sm:order-2"
          >
            ダウンロード
          </button>
        </div>
      </div>
    </div>
  )
}